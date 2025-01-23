import { StatusCodes } from "http-status-codes";
import sgMail from "@sendgrid/mail";
import type { OfficeHour, OfficeHourSchema } from "@/common/schemas/officeHoursSchema";
import { OfficeHourRepository } from "@/database/officeHoursRepository";
import { ServiceResponse } from "@/common/schemas/serviceResponse";
import { logger } from "@/server";
import ical, { ICalEventRepeatingFreq, ICalEvent, ICalEventData } from "ical-generator";
import { z } from "zod";

// initialize SendGrid API
//sgMail.setApiKey(SENDGRID_KEY);

export class OfficeHourService {
  private officeHourRepository: OfficeHourRepository;

  constructor(repository: OfficeHourRepository) {
    this.officeHourRepository = repository;
  }

  transformTime(day: string, time: string): Date {
    const dayOfWeek: { [key: string]: number } = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };

    const today = new Date();
    const index_of_today = today.getDay();
    const office_hour_day_index = dayOfWeek[day];

    const officeHourDate = new Date();
    officeHourDate.setDate(today.getDate() + ((office_hour_day_index - index_of_today + 7) % 7 || 7));

    const [time_str, am_pm] = time.toLowerCase().split(" ");
    let [hours, minutes] = time_str.split(":").map(Number);

    if (am_pm === "pm" && hours !== 12) {
      hours += 12;
    } else if (am_pm === "am" && hours === 12) {
      hours = 0;
    }

    officeHourDate.setHours(hours);
    officeHourDate.setMinutes(minutes);

    return officeHourDate;
  }

  // Retrieves all courses from the database
  async getAll(): Promise<ServiceResponse<OfficeHour[] | null>> {
    try {
      const officeHours = await this.officeHourRepository.getAllOfficeHours();
      if (!officeHours || officeHours.length === 0) {
        return ServiceResponse.failure("No office hours found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<OfficeHour[]>("Office hours found", officeHours);
    } catch (ex) {
      const errorMessage = `Error finding all office hours: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while retrieving office hours.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getOfficeHoursByUserId(id: string): Promise<ServiceResponse<OfficeHour[] | null>> {
    try {
      const officeHours = await this.officeHourRepository.getOfficeHoursByUserId(id);
      // const officeHours = await this.officeHourRepository.getAllOfficeHours();
      if (!officeHours) {
        return ServiceResponse.failure("No office hours found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<OfficeHour[]>("Office hours found", officeHours);
    } catch (ex) {
      const errorMessage = `Error finding office hour by id: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while retrieving office hours.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteOfficeHours(officeHourIds: number[], userId: string): Promise<ServiceResponse<{ deletedCount: number }>> {
    try {
      const result = await this.officeHourRepository.deleteOfficeHours(officeHourIds, userId);

      if (result.affectedRows === 0) {
        return ServiceResponse.failure("No office hours were found to delete", { deletedCount: 0 }, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success(`Successfully deleted ${result.affectedRows} office hours`, { deletedCount: result.affectedRows });
    } catch (ex) {
      const errorMessage = `Error deleting office hours: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while deleting office hours", { deletedCount: 0 }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createIcalEvents(officeHours: OfficeHour[], calendarName: string): Promise<ServiceResponse<string | null>> {
    try {
      if (!officeHours) {
        return ServiceResponse.failure("No office hours found", null, StatusCodes.NOT_FOUND);
      }
  
      // create ical file
      const ical_file = ical({ name: calendarName });

      // define semesterEnd (office hour events will repeat for however many weeks)
      const semesterEnd = new Date(Date.now() + 3 * 3600 * 1000 * 24 * 7 * 5); // 15 weeks from now
  
      // set the timezone
      ical_file.timezone('America/New_York');

      for (const oh of officeHours) {
        // Base event properties that are common to all modes
        const eventConfig: ICalEventData = {
          start: this.transformTime(oh.day, oh.start_time),
          end: this.transformTime(oh.day, oh.end_time),
          timezone: 'America/New_York',
          summary: `${oh.host}'s Office Hours`,
          organizer: {
            name: oh.host,
          },
          repeating: {
            freq: ICalEventRepeatingFreq.WEEKLY,
            until: semesterEnd,
          },
        };
  
        // Add optional properties based on mode
        if (oh.mode !== "remote") {
          eventConfig.location = oh.location;
        }
        if (oh.mode !== "in-person") {
          eventConfig["url"] = oh.link;
        }
  
        ical_file.createEvent(eventConfig);
      }
  
      const data_str = ical_file.toString();
      if (!data_str) {
        throw new Error("Empty calendar data.");
      }
  
      const url = `data:text/calendar;base64,${Buffer.from(data_str).toString("base64")}`;
      return ServiceResponse.success<string>("Office hours found", url);
    } catch (ex) {
      const errorMessage = `Error in generating office hour ical file: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving and storing office hours to ical file.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  async getIcalFileByIds(officeHourIds: number[]): Promise<ServiceResponse<string | null>> {
    try {
      const officeHours = await this.officeHourRepository.getOfficeHoursByIds(officeHourIds);
      return this.createIcalEvents(officeHours, `Office Hours for Selected Classes`);
    } catch (ex) {
      const errorMessage = `Error in generating office hour ical file by id: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving and storing office hours to ical file.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  async getIcalFileByUserId(user_id: string): Promise<ServiceResponse<string | null>> {
    try {
      const officeHours = await this.officeHourRepository.getOfficeHoursByUserId(user_id);
      return this.createIcalEvents(officeHours, `Office Hours for User ${user_id}`);
    } catch (ex) {
      const errorMessage = `Error in generating office hour ical file by user_id: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving and storing office hours to ical file.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async storeOfficeHour(data: z.infer<typeof OfficeHourSchema>, userId: string): Promise<ServiceResponse<OfficeHour | null>> {
    try {
      const officeHour = await this.officeHourRepository.storeOfficeHour(data, userId);
      return ServiceResponse.success("Office hour created successfully", officeHour);
    } catch (ex) {
      const errorMessage = `Error storing office hour: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while storing the office hour", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  
  async storeListOfficeHour(data: z.infer<typeof OfficeHourSchema>[], userId: string): Promise<ServiceResponse<OfficeHour[] | null>> {
    try {
      const officeHours = await this.officeHourRepository.storeListOfficeHours(data, userId);
      return ServiceResponse.success("Office hours created successfully", officeHours);
    } catch (ex) {
      const errorMessage = `Error storing office hours: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while storing the office hours", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async sendEmailNotification(users: { email: string }[], updatedOfficeHour: any): Promise<void> {
    const messages = users.map(user => ({
        to: user.email,
        from: 'synchrohnize@gmail.com',
        subject: 'Updated Office Hours Notification',
        text: `Hello,

We wanted to let you know that the office hours for the course have been updated.

Updated Office Hours:
- Host: ${updatedOfficeHour.host}
- Day: ${updatedOfficeHour.day}
- Time: ${updatedOfficeHour.start_time} - ${updatedOfficeHour.end_time}
- Mode: ${updatedOfficeHour.mode}
- Location: ${updatedOfficeHour.location || 'N/A'}
- Link: ${updatedOfficeHour.link || 'N/A'}

Thank you!`,
    }));

    try {
        await sgMail.send(messages);
        console.log('Emails sent successfully.');
    } catch (error) {
        console.error('Error sending emails:', error);
    }
}

async updateOfficeHour(id: number, data: z.infer<typeof OfficeHourSchema>, userId: string): Promise<ServiceResponse<OfficeHour | null>> {
    try {
        const officeHour = await this.officeHourRepository.updateOfficeHour(id, data, userId);

        // Fetch users enrolled in the course 
        const users = await this.officeHourRepository.getUsersByCourseId(data.course_id);
        if (users && users.length > 0) {
            // Send email notifications to all users
            await this.sendEmailNotification(users, officeHour);
            console.log("email sent");
        }

        return ServiceResponse.success("Office hour updated successfully", officeHour);
    } catch (ex) {
        const errorMessage = `Error storing office hours: ${(ex as Error).message}`;
        logger.error(errorMessage);
        return ServiceResponse.failure("An error occurred while storing the office hours", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

}
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
    username: z.string().min(1, {
      message: "Field cannot be empty.",
    }),
    course: z.string().min(1, {
      message: "Field cannot be empty.",
    }),
    host: z.string().min(1, {
      message: "Field cannot be empty.",
    }),
    days: z.enum(["M", "T", "W", "Th", "F", "Sa", "Su"], {
        required_error: "You need to select a day.",
      }),
    mode: z.enum(["in-person", "online"], {
        required_error: "You need to select a mode.",
      }),
    location: z.string().min(1, {
      message: "Field cannot be empty.",
    }),
    link: z.string().url({
      message: "Link must be a valid URL.",
    }),
  })

export function AddHoursForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            course: "",
            host: "",
            location: "",
            link: "",
        },
    })

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
        console.log("hi")
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="course"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Course Code</FormLabel>
                        <FormControl>
                            <Input placeholder="Course code..." {...field} />
                        </FormControl>
                        <FormDescription>
                            This is course code.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="host"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Host</FormLabel>
                        <FormControl>
                            <Input placeholder="host..." {...field} />
                        </FormControl>
                        <FormDescription>
                            This is your teaching assistant.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="days"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Day of the week:</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a day..." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="M">Monday</SelectItem>
                                <SelectItem value="T">Tuesday</SelectItem>
                                <SelectItem value="W">Wednesday</SelectItem>
                                <SelectItem value="Th">Thursday</SelectItem>
                                <SelectItem value="F">Friday</SelectItem>
                                <SelectItem value="Sa">Saturday</SelectItem>
                                <SelectItem value="Su">Sunday</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="mode"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Modality:</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a modality..." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="in-person">In-person</SelectItem>
                                <SelectItem value="online">Online</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                            <Input placeholder="Example: MALA5200" {...field} />
                        </FormControl>
                        <FormDescription>
                            This is the location of the office hours if in-person
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Link</FormLabel>
                        <FormControl>
                            <Input placeholder="Example: https://ufl.zoom.us/j/123456789" {...field} />
                        </FormControl>
                        <FormDescription>
                            This is the link to the office hours if online.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <Button type="submit">Submit</Button>
            </form>
        </Form>
        )
}
# Office Hours App
## React.js & Express.js Monorepo Setup

To install dependencies:

```bash
bun install
```

To run the frontend:

```bash
bun run frontend
```

To run the backend:

```bash
bun run backend
```

This project was created using `bun init` in bun v0.4.0. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

The backend is stored in `/apps/backend`, and the frontend is stored in `/apps/frontend`. The main file for both is `index.ts`.

## Pushing to main

### 1. **Create a new branch**
```bash
git checkout -b <new-branch-name>
```

### 2. **Make changes and commit**
```bash
git add .
git commit -m "Your commit message"
```

### 2.5. **Set Git to always set upstream when pushing** (you will see why if you try pushing without doing this)
```bash
git config --global push.autoSetupRemote true
```

### 3. **Push to remote**
```bash
git push origin <new-branch-name>
```

### 4. **Create a Pull Request (PR)**
- Click the link generated in the terminal to make your PR.

### 5. **Merge PR into main**
- Merge your code into main if you think its good and proper, otherwise ask team to check. 

### 6. **Pull the latest changes from main**
```bash
git checkout main
git pull origin main
```
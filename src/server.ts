import app from "./app";
import "dotenv/config";

if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

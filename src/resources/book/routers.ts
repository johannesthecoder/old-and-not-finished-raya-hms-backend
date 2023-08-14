import express = require("express");
import { addBook, findBookById, findBooks, updateBookById } from "./controller";
import { verifyToken } from "../../core/middleware";

export const bookRouter = express.Router();

bookRouter.post("/", verifyToken, addBook);
bookRouter.get("/:id([0-9a-f]{24})", verifyToken, findBookById);
bookRouter.get("/", verifyToken, findBooks);
bookRouter.patch("/:id([0-9a-f]{24})", verifyToken, updateBookById);

import * as usersService from "../services/user.service.js";

export async function me(req, res) {
  try {
    const result = await usersService.getMe(req.user.id);
    return res.json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
  }
}

export async function updateMe(req, res) {
  try {
    const result = await usersService.updateMe(req.user.id, req.body);
    return res.json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
  }
}

export async function list(req, res) {
  try {
    const result = await usersService.listUsers(req.query);
    return res.json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
  }
}
import * as authService from "../services/auth.service.js";

export async function signup(req, res) {
  try {
    const result = await authService.signup(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
  }
}

export async function login(req, res) {
  try {
    const result = await authService.login(req.body);
    return res.json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
  }
}

export async function me(req, res) {
  try {
    const result = await authService.me(req.user.id);
    return res.json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
  }
}
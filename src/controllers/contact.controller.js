import * as contactsService from "../services/contact.service.js";

export async function create(req, res) {
  try {
    const result = await contactsService.createContact(req.user, req.body);
    return res.status(201).json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
}

export async function update(req, res) {
  const parsed = Number(req.params.id);

  if (Number.isNaN(parsed)) {
    return res.status(400).json({ message: "Invalid leadId" });
  }

  req.params.id = parsed;
  try {
    const result = await contactsService.updateContact(
      req.user,
      req.params.id,
      req.body,
    );
    return res.json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
}

export async function list(req, res) {
  try {
    const result = await contactsService.listContacts(req.user, req.query);
    return res.json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
}

export async function getOne(req, res) {
  const parsed = Number(req.params.id);

  if (Number.isNaN(parsed)) {
    return res.status(400).json({ message: "Invalid leadId" });
  }

  req.params.id = parsed;
  try {
    const result = await contactsService.getContact(req.user, req.params.id);
    return res.json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
}

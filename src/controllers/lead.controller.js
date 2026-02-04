import * as leadsService from "../services/lead.service.js";

export async function create(req, res) {
  try {
    const result = await leadsService.createLead(req.user.id, req.body);
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
    const result = await leadsService.updateLead(
      req.user.id,
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
    const result = await leadsService.listLeads(req.user.id, req.query);
    return res.json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
}

export async function convert(req, res) {
  const parsed = Number(req.params.id);

  if (Number.isNaN(parsed)) {
    return res.status(400).json({ message: "Invalid leadId" });
  }

  req.params.id = parsed;
  try {
    const result = await leadsService.convertLead(req.user.id, req.params.id);
    return res.status(201).json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
}

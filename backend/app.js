const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { createReport } = require("docx-templates");

const app = express();
app.use(cors());
app.use(express.json());
console.log("")
function formatDateToVN(dateStr) {
  if (!dateStr) return "";

  const parts = dateStr.split("-"); // YYYY-MM-DD
  if (parts.length !== 3) return dateStr;

  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}
function formatSiblings(siblings) {
  if (!siblings || siblings.length === 0) {
    return "- Không có";
  }

  return siblings
    .map((s, i) => {
      const name = (s.name || "").padEnd(20, " ");
      const yob = (s.yob || "").padEnd(20, " ");

      const line = `- ${name} Năm sinh: ${yob} Nghề nghiệp: ${s.job || ""}`;
      return i === 0 ? line : " " + line;
    })
    .join("\r\n");
}
/* =============================
   👉 API TẠO SƠ YẾU LÝ LỊCH DOCX
============================= */
app.post("/generate-docx", async (req, res) => {
  try {
    let day = "", month = "", year = "";

    if (req.body.dob) {
      [year, month, day] = req.body.dob.split("-");
    }

    /* ===== CHỌN TEMPLATE ===== */
    const educationType = req.body.educationType;

    let templateFile = "he_9+.docx";

    if (educationType === "college") {
      templateFile = "he_cao_dang.docx";
    }

    const template = fs.readFileSync(
      path.join(__dirname, "template", templateFile)
    );

    const buffer = await createReport({
      template,
      data: {
        fullName: (req.body.fullName || "").toUpperCase(),
        sex: req.body.sex || "",
        day,
        month,
        year,
        birthPlace: req.body.birthPlace || "",
        origin: req.body.origin || "",
        address: req.body.address || "",
        phone: req.body.phone || "",
        ethnicity: req.body.ethnicity || "",
        religion: req.body.religion || "",
        cccd: req.body.cccd || "",
        issued_date: formatDateToVN(req.body.issued_date),
        issuePlace: req.body.issuePlace || "",

        tieu_hoc: req.body.tieu_hoc || "",
        thcs: req.body.thcs || "",
        thpt: req.body.thpt || "", // 👈 thêm cho hệ cao đẳng

        father_name: req.body.father_name || "",
        father_yob: req.body.father_yob || "",
        father_job: req.body.father_job || "",
        father_address: req.body.father_address || "",

        mother_name: req.body.mother_name || "",
        mother_yob: req.body.mother_yob || "",
        mother_job: req.body.mother_job || "",
        mother_address: req.body.mother_address || "",

        siblings: formatSiblings(req.body.siblings),
      },
    });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=so-yeu-ly-lich.docx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    res.send(buffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi tạo file" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại port ${PORT}`);
});
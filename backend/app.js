const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { createReport } = require("docx-templates");

const app = express();

app.use(cors());
app.use(express.json());

/* =================================
   FORMAT DATE
================================= */
function formatDateToVN(dateStr) {
  if (!dateStr) return "";

  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;

  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

/* =================================
   LẤY ANH CHỊ EM
================================= */
function getSibling(siblings, index) {
  return siblings?.[index] || {
    name: "",
    yob: "",
    job: "",
  };
}

/* =================================
   API TẠO DOCX
================================= */
app.post("/generate-docx", async (req, res) => {
  try {
    const educationType = req.body.educationType || "9plus";
    const isCollege = educationType === "college";

    /* ===== NGÀY SINH ===== */
    let day = "";
    let month = "";
    let year = "";

    if (req.body.dob) {
      [year, month, day] = req.body.dob.split("-");
    }

    /* ===== TEMPLATE DUY NHẤT ===== */
    const template = fs.readFileSync(
      path.join(__dirname, "template", "so_yeu_ly_lich_v2.docx")
    );

    /* ===== TRÌNH ĐỘ ===== */
    const cultural_level = isCollege ? "12/12" : "9/12";

    /* ===== ANH CHỊ EM ===== */
    const sibling1 = getSibling(req.body.siblings, 0);
    const sibling2 = getSibling(req.body.siblings, 1);
    const sibling3 = getSibling(req.body.siblings, 2);
    const sibling4 = getSibling(req.body.siblings, 3);

    /* ===== CREATE DOCX ===== */
    const buffer = await createReport({
      template,
      data: {
        /* ===== CÁ NHÂN ===== */
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

        cultural_level,

        /* ===== HỌC VẤN ===== */
        tieu_hoc: req.body.tieu_hoc || "",
        thcs: req.body.thcs || "",

        // 🎯 KHÁC BIỆT DUY NHẤT
        thpt: isCollege
          ? (req.body.thpt?.trim() || "")
          : " ",

        /* ===== CHA ===== */
        father_name: req.body.father_name || "",
        father_yob: req.body.father_yob || "",
        father_job: req.body.father_job || "",
        father_address: req.body.father_address || "",

        /* ===== MẸ ===== */
        mother_name: req.body.mother_name || "",
        mother_yob: req.body.mother_yob || "",
        mother_job: req.body.mother_job || "",
        mother_address: req.body.mother_address || "",

        /* ===== ANH CHỊ EM ===== */
        sibling1_name: sibling1.name,
        sibling1_yob: sibling1.yob,
        sibling1_job: sibling1.job,

        sibling2_name: sibling2.name,
        sibling2_yob: sibling2.yob,
        sibling2_job: sibling2.job,

        sibling3_name: sibling3.name,
        sibling3_yob: sibling3.yob,
        sibling3_job: sibling3.job,

        sibling4_name: sibling4.name,
        sibling4_yob: sibling4.yob,
        sibling4_job: sibling4.job,
      },
    });

    /* ===== RESPONSE ===== */
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
    res.status(500).json({
      message: "Lỗi tạo file",
    });
  }
});

/* =================================
   START SERVER
================================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại port ${PORT}`);
});
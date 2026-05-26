import { useState } from "react";
import axios from "axios";

export default function SoYeuLyLichForm() {
  const [form, setForm] = useState({
    educationType: "9plus",

    fullName: "",
    sex: "Nam",
    dob: "",

    birthPlace: "",
    origin: "",
    address: "",
    phone: "",

    ethnicity: "Kinh",
    religion: "Không",

    cccd: "",
    issued_date: "",
    issuePlace: "Bộ Công An",

    tieu_hoc: "",
    thcs: "",
    thpt: "",

    father_name: "",
    father_yob: "",
    father_job: "Lao động tự do",
    father_address: "",

    mother_name: "",
    mother_yob: "",
    mother_job: "Lao động tự do",
    mother_address: "",

    /* ===== ANH CHỊ EM ===== */
    sibling1_name: "",
    sibling1_yob: "",
    sibling1_job: "",

    sibling2_name: "",
    sibling2_yob: "",
    sibling2_job: "",

    sibling3_name: "",
    sibling3_yob: "",
    sibling3_job: "",

    sibling4_name: "",
    sibling4_yob: "",
    sibling4_job: "",
  });

  const [qrInput, setQrInput] = useState("");

  /* =====================================
     HANDLE CHANGE
  ===================================== */
  // const handleChange = (e) => {
  //   setForm((prev) => ({
  //     ...prev,
  //     [e.target.name]: e.target.value,
  //   }));
  // };
  const normalizeText = (value) => {
  if (!value) return "";

  return value
    .trimStart()
    .toLowerCase()
    .split(" ")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
};
  const handleChange = (e) => {
    const { name, value } = e.target;

    // 🎯 Các field cần auto format
    const autoFormatFields = [
      "fullName",
      "birthPlace",
      "origin",
      "address",

      "father_name",
      "father_address",

      "mother_name",
      "mother_address",

      "sibling1_name",

      "sibling2_name",

      "sibling3_name",
      "sibling3_job",

      "sibling4_name",
    ];

    setForm((prev) => ({
      ...prev,
      [name]: autoFormatFields.includes(name)
        ? normalizeText(value)
        : value.trimStart(),
    }));
  };

  /* =====================================
     FORMAT DATE
  ===================================== */
  const formatDate = (str) => {
    if (!str) return "";

    if (str.length === 8 && !str.includes("-")) {
      const d = str.slice(0, 2);
      const m = str.slice(2, 4);
      const y = str.slice(4, 8);

      return `${y}-${m}-${d}`;
    }

    return str;
  };

  /* =====================================
     PARSE QR CCCD
  ===================================== */
  const parseQR = (text) => {
    const parts = text.split("|");

    return {
      cccd: parts[0] || "",
      fullName: parts[2] || "",
      dob: formatDate(parts[3]),
      sex: parts[4] || "Nam",

      origin: parts[5] || "",
      address: parts[5] || "",

      issued_date: formatDate(parts[6]),

      father_name: parts[8] || "",
      mother_name: parts[9] || "",
    };
  };

  /* =====================================
     HANDLE QR INPUT
  ===================================== */
  const handleQRInput = (e) => {
    const value = e.target.value;

    setQrInput(value);

    if (!value.includes("|")) return;

    const data = parseQR(value);

    setForm((prev) => ({
      ...prev,
      ...data,
    }));
  };

  /* =====================================
     SUBMIT
  ===================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const isCollege =
        form.educationType === "college";

      // 🎯 CHUYỂN ĐỔI SIBLING
      const siblings = [
        {
          name: form.sibling1_name,
          yob: form.sibling1_yob,
          job: form.sibling1_job,
        },
        {
          name: form.sibling2_name,
          yob: form.sibling2_yob,
          job: form.sibling2_job,
        },
        {
          name: form.sibling3_name,
          yob: form.sibling3_yob,
          job: form.sibling3_job,
        },
        {
          name: form.sibling4_name,
          yob: form.sibling4_yob,
          job: form.sibling4_job,
        },
      ];

      const payload = {
        ...form,

        // 🎯 THÊM DÒNG NÀY → FIX LỖI
        siblings,

        // 🎯 ĐỒNG BỘ BACKEND
        thpt: isCollege
          ? form.thpt?.trim() || ""
          : " ",
      };

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/generate-docx`,
        payload,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([res.data])
      );

      const a = document.createElement("a");

      a.href = url;

      const safeName = form.fullName
        ?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_]/g, "");

      a.download = `so-yeu-${safeName}.docx`;

      a.click();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);
      alert("Lỗi tạo file");
    }
  };

  return (
    <div className="container">
      <h2 className="title">
        SƠ YẾU LÝ LỊCH
      </h2>

      <form onSubmit={handleSubmit}>

        {/* =====================================
            HỆ ĐÀO TẠO
        ===================================== */}
        <div className="section">
          <h3>Loại hệ đào tạo</h3>

          <select
            name="educationType"
            value={form.educationType}
            onChange={(e) => {
              const value = e.target.value;

              setForm((prev) => ({
                ...prev,
                educationType: value,

                // 🎯 Đồng bộ backend
                thpt:
                  value === "9plus"
                    ? ""
                    : prev.thpt || "",
              }));
            }}
          >
            <option value="9plus">
              Hệ 9+
            </option>

            <option value="college">
              Hệ Cao Đẳng
            </option>
          </select>
        </div>

        {/* =====================================
            QR CCCD
        ===================================== */}
        <div className="section qr-box">
          <h3>Nhập mã QR CCCD</h3>

          <textarea
            value={qrInput}
            onChange={handleQRInput}
            placeholder="Dán chuỗi QR tại đây..."
          />
        </div>

        {/* =====================================
            THÔNG TIN CÁ NHÂN
        ===================================== */}
        <div className="section">
          <h3>Thông tin cá nhân</h3>

          <div className="grid">

            <FormInput
              label="Họ và tên"
              name="fullName"
              form={form}
              onChange={handleChange}
            />

            <FormSelect
              label="Giới tính"
              name="sex"
              form={form}
              onChange={handleChange}
              options={["Nam", "Nữ"]}
            />

            <FormDate
              label="Ngày sinh"
              name="dob"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="Nơi sinh"
              name="birthPlace"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="Nguyên quán"
              name="origin"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="Địa chỉ thường trú"
              name="address"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="SĐT"
              name="phone"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="Dân tộc"
              name="ethnicity"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="Tôn giáo"
              name="religion"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="Số CCCD"
              name="cccd"
              form={form}
              onChange={handleChange}
            />

            <FormDate
              label="Ngày cấp"
              name="issued_date"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="Nơi cấp"
              name="issuePlace"
              form={form}
              onChange={handleChange}
            />

          </div>
        </div>

        {/* =====================================
            HỌC VẤN
        ===================================== */}
        <div className="section">
          <h3>Học vấn</h3>

          <div className="grid">

            <FormInput
              label="Tiểu học"
              name="tieu_hoc"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="THCS"
              name="thcs"
              form={form}
              onChange={handleChange}
            />

            {form.educationType === "college" && (
              <FormInput
                label="THPT"
                name="thpt"
                form={form}
                onChange={handleChange}
              />
            )}

          </div>
        </div>

        {/* =====================================
            CHA
        ===================================== */}
        <div className="section">
          <h3>Thông tin Cha</h3>

          <div className="grid">

            <FormInput
              label="Họ tên Cha"
              name="father_name"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="Năm sinh"
              name="father_yob"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="Nghề nghiệp"
              name="father_job"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="Địa chỉ"
              name="father_address"
              form={form}
              onChange={handleChange}
            />

          </div>
        </div>

        {/* =====================================
            MẸ
        ===================================== */}
        <div className="section">
          <h3>Thông tin Mẹ</h3>

          <div className="grid">

            <FormInput
              label="Họ tên Mẹ"
              name="mother_name"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="Năm sinh"
              name="mother_yob"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="Nghề nghiệp"
              name="mother_job"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="Địa chỉ"
              name="mother_address"
              form={form}
              onChange={handleChange}
            />

          </div>
        </div>

        {/* =====================================
            ANH CHỊ EM
        ===================================== */}
        <div className="section">
          <h3>Anh chị em ruột</h3>

          {/* ===== NGƯỜI 1 ===== */}
          <div className="grid" style={{ marginBottom: "25px" }}>

            <FormInput
              label="Họ tên anh/chị/em 1"
              name="sibling1_name"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="Năm sinh"
              name="sibling1_yob"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="Nghề nghiệp"
              name="sibling1_job"
              form={form}
              onChange={handleChange}
            />

          </div>

          {/* ===== NGƯỜI 2 ===== */}
          <div className="grid" style={{ marginBottom: "25px" }}>

            <FormInput
              label="Họ tên anh/chị/em 2"
              name="sibling2_name"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="Năm sinh"
              name="sibling2_yob"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="Nghề nghiệp"
              name="sibling2_job"
              form={form}
              onChange={handleChange}
            />

          </div>

          {/* ===== NGƯỜI 3 ===== */}
          <div className="grid" style={{ marginBottom: "25px" }}>

            <FormInput
              label="Họ tên anh/chị/em 3"
              name="sibling3_name"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="Năm sinh"
              name="sibling3_yob"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="Nghề nghiệp"
              name="sibling3_job"
              form={form}
              onChange={handleChange}
            />

          </div>

          {/* ===== NGƯỜI 4 ===== */}
          <div className="grid">

            <FormInput
              label="Họ tên anh/chị/em 4"
              name="sibling4_name"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="Năm sinh"
              name="sibling4_yob"
              form={form}
              onChange={handleChange}
            />

            <FormInput
              label="Nghề nghiệp"
              name="sibling4_job"
              form={form}
              onChange={handleChange}
            />

          </div>
        </div>

        <button
          type="submit"
          className="btn-submit"
        >
          Tạo DOCX
        </button>

      </form>
    </div>
  );
}

/* =====================================
   COMPONENTS
===================================== */

const FormInput = ({
  label,
  name,
  form,
  onChange,
}) => (
  <div className="form-group">
    <label>{label}</label>

    <input
      name={name}
      value={form[name]}
      onChange={onChange}
    />
  </div>
);

const FormSelect = ({
  label,
  name,
  form,
  onChange,
  options,
}) => (
  <div className="form-group">
    <label>{label}</label>

    <select
      name={name}
      value={form[name]}
      onChange={onChange}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

const FormDate = ({
  label,
  name,
  form,
  onChange,
}) => (
  <div className="form-group">
    <label>{label}</label>

    <input
      type="date"
      name={name}
      value={form[name]}
      onChange={onChange}
    />
  </div>
);
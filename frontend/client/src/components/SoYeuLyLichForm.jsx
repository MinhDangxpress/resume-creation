import { useState } from "react";
import axios from "axios";

export default function SoYeuLyLichForm() {

  const [educationType, setEducationType] = useState("9plus");

  const [form, setForm] = useState({
    fullName: "",
    sex: "Nam",
    dob: "",
    birthPlace: "",
    origin: "",
    address: "",
    phone: "",
    ethnicity: "",
    religion: "",
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

    siblings: []
  });

  const [qrInput, setQrInput] = useState("");
  const [hasSibling, setHasSibling] = useState(false);

  /* ===================== */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ===================== */
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

  /* ===================== */
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

  /* ===================== */
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

  /* ===================== */
  const handleSiblingChange = (index, field, value) => {
    const updated = [...form.siblings];
    updated[index][field] = value;
    setForm({ ...form, siblings: updated });
  };

  const addSibling = () => {
    setForm({
      ...form,
      siblings: [...form.siblings, { name: "", yob: "", job: "" }]
    });
  };

  const removeSibling = (index) => {
    const updated = form.siblings.filter((_, i) => i !== index);
    setForm({ ...form, siblings: updated });
  };

  /* ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/generate-docx`,
        form,
        { responseType: "blob" }  
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      const safeName = form.fullName
        ?.normalize("NFD")                  // bỏ dấu
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_")               // space → _
        .replace(/[^a-zA-Z0-9_]/g, "");     // bỏ ký tự đặc biệt

      a.download = `so-yeu-${safeName}.docx`;
      a.click();
    } catch (err) {
      alert("Lỗi tạo file");
    }
  };

  return (
    <div className="container">
      <h2 className="title">SƠ YẾU LÝ LỊCH</h2>

      <form onSubmit={handleSubmit}>

        {/* ===== CHỌN HỆ ===== */}
        <div className="section">
          <h3>Loại hệ đào tạo</h3>

          <select
            value={educationType}
            onChange={(e) => setEducationType(e.target.value)}
          >
            <option value="9plus">Hệ 9+</option>
            <option value="college">Hệ Cao Đẳng</option>
          </select>
        </div>

        {/* ===== QR ===== */}
        <div className="section qr-box">
          <h3>Nhập mã QR CCCD</h3>
          <textarea
            value={qrInput}
            onChange={handleQRInput}
            placeholder="Dán chuỗi QR tại đây..."
          />
        </div>

        {/* ===== CÁ NHÂN ===== */}
        <div className="section">
          <h3>Thông tin cá nhân</h3>
          <div className="grid">

            <FormInput label="Họ và tên" name="fullName" form={form} onChange={handleChange} />
            <FormSelect label="Giới tính" name="sex" form={form} onChange={handleChange} options={["Nam", "Nữ"]} />
            <FormDate label="Ngày sinh" name="dob" form={form} onChange={handleChange} />
            <FormInput label="Nơi sinh" name="birthPlace" form={form} onChange={handleChange} />
            <FormInput label="Nguyên quán" name="origin" form={form} onChange={handleChange} />
            <FormInput label="Địa chỉ thường trú" name="address" form={form} onChange={handleChange} />
            <FormInput label="SĐT" name="phone" form={form} onChange={handleChange} />
            <FormInput label="Dân tộc" name="ethnicity" form={form} onChange={handleChange} />
            <FormInput label="Tôn giáo" name="religion" form={form} onChange={handleChange} />
            <FormInput label="Số CCCD" name="cccd" form={form} onChange={handleChange} />
            <FormDate label="Ngày cấp" name="issued_date" form={form} onChange={handleChange} />
            <FormInput label="Nơi cấp" name="issuePlace" form={form} onChange={handleChange} />

          </div>
        </div>

        {/* ===== HỌC VẤN ===== */}
        <div className="section">
          <h3>Học vấn</h3>
          <div className="grid">

            <FormInput label="Tiểu học" name="tieu_hoc" form={form} onChange={handleChange} />
            <FormInput label="THCS" name="thcs" form={form} onChange={handleChange} />

            {educationType === "college" && (
              <FormInput label="THPT" name="thpt" form={form} onChange={handleChange} />
            )}

          </div>
        </div>

        {/* ===== SIBLINGS ===== */}
        <div className="section">
          <h3>Anh chị em ruột</h3>

          <select
            value={hasSibling ? "yes" : "no"}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "no") {
                setHasSibling(false);
                setForm({ ...form, siblings: [] });
              } else {
                setHasSibling(true);
                if (form.siblings.length === 0) addSibling();
              }
            }}
          >
            <option value="no">Không có</option>
            <option value="yes">Có</option>
          </select>

          {hasSibling && form.siblings.map((s, i) => (
            <div key={i} className="sibling-box">
              <input placeholder="Họ tên" value={s.name}
                onChange={(e) => handleSiblingChange(i, "name", e.target.value)} />
              <input placeholder="Năm sinh" value={s.yob}
                onChange={(e) => handleSiblingChange(i, "yob", e.target.value)} />
              <input placeholder="Nghề nghiệp" value={s.job}
                onChange={(e) => handleSiblingChange(i, "job", e.target.value)} />

              <button type="button" onClick={() => removeSibling(i)}>Xóa</button>
            </div>
          ))}

          {hasSibling && (
            <button type="button" onClick={addSibling}>
              + Thêm
            </button>
          )}
        </div>

        <button type="submit" className="btn-submit">
          Tạo DOCX
        </button>

      </form>
    </div>
  );
}

/* ===== COMPONENT TÁI SỬ DỤNG ===== */

const FormInput = ({ label, name, form, onChange }) => (
  <div className="form-group">
    <label>{label}</label>
    <input name={name} value={form[name]} onChange={onChange} />
  </div>
);

const FormSelect = ({ label, name, form, onChange, options }) => (
  <div className="form-group">
    <label>{label}</label>
    <select name={name} value={form[name]} onChange={onChange}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  </div>
);

const FormDate = ({ label, name, form, onChange }) => (
  <div className="form-group">
    <label>{label}</label>
    <input type="date" name={name} value={form[name]} onChange={onChange} />
  </div>
);
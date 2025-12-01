import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { createCourse, updateCourse, getCourse } from "../api/courseService";
import { getTeachers, createTeacher } from "../api/teacherService";
import axios from "axios";

interface Props {
  open: boolean;
  mode: "create" | "update";
  course?: { id: number; title?: string; name?: string };
  onClose: () => void;
  onSaved: () => void;
}

export function CourseCreateUpdateModal({ open, mode, course, onClose, onSaved }: Props) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [term, setTerm] = useState("");
  const [ownerId, setOwnerId] = useState<number | "">("");
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [addingTeacher, setAddingTeacher] = useState(false);
  const [newTeacherTitle, setNewTeacherTitle] = useState("");
  const [newTeacherOffice, setNewTeacherOffice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isUpdate = mode === "update";

  useEffect(() => {
    if (!open) return;
    setError("");
    setSaving(false);
    const loadRefs = async () => {
      try {
        const [tRes, dRes] = await Promise.all([
          getTeachers(),
          axios.get((import.meta.env.VITE_API_URL || "http://localhost:8080") + "/api/departments"),
        ]);
        setTeachers(Array.isArray(tRes) ? tRes : []);
        setDepartments(Array.isArray(dRes.data) ? dRes.data : []);
      } catch (_) {}
    };
    loadRefs();
    if (isUpdate && course?.id != null) {
      (async () => {
        try {
          const full = await getCourse(course.id);
          setCode(full?.code ?? "");
          setName(full?.name ?? "");
          setTerm(full?.term ?? "");
          setOwnerId(full?.owner?.id ?? "");
          setDepartmentId(full?.department?.id ?? "");
        } catch (_) {
          setCode("");
          setName(course?.name ?? course?.title ?? "");
          setTerm("");
          setOwnerId("");
          setDepartmentId("");
        }
      })();
    } else {
      setCode("");
      setName("");
      setTerm("");
      setOwnerId("");
      setDepartmentId("");
    }
  }, [open, isUpdate, course]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && !saving) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, saving, onClose]);

  const disabled = useMemo(() => {
    return !code.trim() || !name.trim() || !term.trim() || ownerId === "";
  }, [code, name, term, ownerId]);

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      if (isUpdate && course) {
        await updateCourse(course.id, {
          code: code.trim(),
          name: name.trim(),
          term: term.trim(),
          ownerId: Number(ownerId),
          departmentId: departmentId === "" ? undefined : Number(departmentId),
        });
      } else {
        await createCourse({
          code: code.trim(),
          name: name.trim(),
          term: term.trim(),
          ownerId: Number(ownerId),
          departmentId: departmentId === "" ? undefined : Number(departmentId),
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || "Kaydetme başarısız oldu.";
      setError(String(msg));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTeacher = async () => {
    setError("");
    try {
      const created = await createTeacher({ title: newTeacherTitle.trim(), officeRoom: newTeacherOffice.trim() });
      setAddingTeacher(false);
      setNewTeacherTitle("");
      setNewTeacherOffice("");
      await (async () => {
        const list = await getTeachers();
        setTeachers(Array.isArray(list) ? list : []);
      })();
      if (created?.id != null) setOwnerId(Number(created.id));
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || "Öğretmen oluşturma başarısız oldu.";
      setError(String(msg));
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={() => (!saving ? onClose() : null)} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">{isUpdate ? "Dersi Düzenle" : "Yeni Ders Oluştur"}</h3>
        <p className="text-sm text-slate-500">Zorunlu alanlar: Kod, İsim, Dönem, Öğretmen</p>
        <div className="mt-4 space-y-3">
          <div>
            <label className="form-label">Kod</label>
            <input className="text-input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Örn. CS101" />
          </div>
          <div>
            <label className="form-label">İsim</label>
            <input className="text-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. Algoritmalar" />
          </div>
          <div>
            <label className="form-label">Dönem</label>
            <input className="text-input" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Örn. 2025-Güz" />
          </div>
          <div>
            <label className="form-label">Öğretmen</label>
            <select className="text-input" value={ownerId} onChange={(e) => setOwnerId(e.target.value as any)}>
              <option value="">Seçin</option>
              {teachers.map((t) => (
                <option key={t?.id} value={t?.id}>{t?.title || `Öğretmen #${t?.id}`}</option>
              ))}
            </select>
            <div className="mt-2">
              <button className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50" type="button" onClick={() => setAddingTeacher((v) => !v)}>
                {addingTeacher ? "Vazgeç" : "Yeni Öğretmen Ekle"}
              </button>
            </div>
            {addingTeacher && (
              <div className="mt-3 grid grid-cols-1 gap-2">
                <input className="text-input" value={newTeacherTitle} onChange={(e) => setNewTeacherTitle(e.target.value)} placeholder="Unvan (opsiyonel)" />
                <input className="text-input" value={newTeacherOffice} onChange={(e) => setNewTeacherOffice(e.target.value)} placeholder="Ofis (opsiyonel)" />
                <button className="primary-button primary-button-inline" type="button" onClick={handleCreateTeacher} disabled={!newTeacherTitle.trim() && !newTeacherOffice.trim()}>
                  Oluştur
                </button>
              </div>
            )}
          </div>
          <div>
            <label className="form-label">Bölüm (opsiyonel)</label>
            <select className="text-input" value={departmentId} onChange={(e) => setDepartmentId(e.target.value as any)}>
              <option value="">Seçin</option>
              {departments.map((d) => (
                <option key={d?.id} value={d?.id}>{d?.name || `Bölüm #${d?.id}`}</option>
              ))}
            </select>
          </div>
          {error && <div className="error-banner">{error}</div>}
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={onClose} disabled={saving}>İptal</button>
          <button className={`primary-button primary-button-inline`} onClick={handleSave} disabled={disabled || saving}>
            {saving ? <span className="button-spinner" /> : isUpdate ? "Güncelle" : "Oluştur"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default CourseCreateUpdateModal;

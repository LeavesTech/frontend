import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { createExam, updateExam, type Exam, type ExamInput } from "../api/examService";
import { getCourses, type Course } from "../api/courseService";

interface Props {
  open: boolean;
  mode: "create" | "update";
  exam?: Exam;
  onClose: () => void;
  onSaved: () => void;
}

function toLocalInputValue(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => `${n}`.padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function toIso(value: string) {
  if (!value) return "";
  const d = new Date(value);
  return d.toISOString();
}

export function CreateUpdateModal({ open, mode, exam, onClose, onSaved }: Props) {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [duration, setDuration] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const noCourseAvailable = !coursesLoading && courses.length === 0;

  const isUpdate = mode === "update";

  useEffect(() => {
    if (!open) return;
    setError("");
    setSaving(false);
    setCoursesLoading(true);
    getCourses()
      .then((list) => setCourses(list || []))
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
    if (isUpdate && exam) {
      setTitle(exam.title || exam.name || "");
      setStart(toLocalInputValue(exam.startDate));
      setEnd(toLocalInputValue(exam.endDate));
      setDuration(exam.durationTime != null ? String(exam.durationTime) : "");
      setType(exam.type || "");
      setCourseId(exam.courseId != null ? String(exam.courseId) : "");
    } else {
      setTitle("");
      setStart("");
      setEnd("");
      setDuration("");
      setType("");
      setCourseId("");
    }
  }, [open, isUpdate, exam]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && !saving) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, saving, onClose]);

  const disabled = useMemo(() => {
    if (!title.trim()) return true;
    if (!start || !end) return true;
    if (!type) return true;
    const dur = Number(duration);
    const course = Number(courseId);
    if (!Number.isFinite(dur) || dur <= 0) return true;
    if (!Number.isFinite(course) || course <= 0) return true;
    if (noCourseAvailable) return true;
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return Number.isNaN(s) || Number.isNaN(e) || s >= e;
  }, [title, start, end, duration, type, courseId, noCourseAvailable]);

  const handleSave = async () => {
    setError("");
    setSaving(true);
    const payload: ExamInput = {
      title: title.trim(),
      startedAt: toIso(start),
      endAt: toIso(end),
      durationTime: Number(duration),
      type,
      courseId: Number(courseId),
    };
    try {
      if (isUpdate && exam) {
        await updateExam(exam.id, payload);
      } else {
        await createExam(payload);
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

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={() => (!saving ? onClose() : null)} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">{isUpdate ? "Sınavı Düzenle" : "Yeni Sınav Oluştur"}</h3>
        <p className="text-sm text-slate-500">Başlık, tarih, süre, tür ve ders</p>
        <div className="mt-4 space-y-3">
          <div>
            <label className="form-label">Sınav Başlığı</label>
            <input className="text-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn. Final Sınavı" />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="form-label">Başlangıç</label>
              <input type="datetime-local" className="text-input" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Bitiş</label>
              <input type="datetime-local" className="text-input" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label className="form-label">Süre (dk)</label>
              <input type="number" min="1" className="text-input" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="60" />
            </div>
            <div>
              <label className="form-label">Tür</label>
              <select className="text-input" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">Seçin</option>
                <option value="LAB">LAB</option>
                <option value="QUIZ">QUIZ</option>
                <option value="HOMEWORK">HOMEWORK</option>
                <option value="MIDTERM">MIDTERM</option>
                <option value="ADDINTIONAL">ADDINTIONAL</option>
                <option value="FINAL">FINAL</option>
                <option value="SUPPLEMENTARY">SUPPLEMENTARY</option>
              </select>
            </div>
            <div>
              <label className="form-label">Ders</label>
              {coursesLoading ? (
                <div className="neutral-banner">Dersler yükleniyor...</div>
              ) : noCourseAvailable ? (
                <div className="error-banner">Hiç ders bulunamadı. Önce ders oluşturun.</div>
              ) : (
                <select className="text-input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                  <option value="">Seçin</option>
                  {courses.map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.title || c.name || `Ders #${c.id}`}</option>
                  ))}
                </select>
              )}
            </div>
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

export default CreateUpdateModal;

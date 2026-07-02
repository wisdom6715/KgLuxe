"use client";
import { useState, useRef } from "react";
import { Pencil, Camera, X, Check, Loader2 } from "lucide-react";
import { useCurrentUser } from "@/hook/useCurrentUser";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase.config";
import { toast } from "sonner";

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({ title, onEdit, children }: { title: string; onEdit?: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:border-[#C9A96E] hover:text-[#A07840] transition-all"
          >
            <Pencil size={13} /> Edit
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({
  label, value, editing, onChange, type = "text", placeholder,
}: {
  label: string; value: string; editing?: boolean;
  onChange?: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
      {editing ? (
        <input
          type={type}
          value={value === "N/A" ? "" : value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder || label}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all"
        />
      ) : (
        <span className="text-sm text-gray-700">
          {value || <span className="text-gray-400 italic">Not set</span>}
        </span>
      )}
    </div>
  );
}

function SaveCancelBar({ onSave, onCancel, saving }: { onSave: () => void; onCancel: () => void; saving?: boolean }) {
  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#C9A96E] text-white hover:bg-[#A07840] transition-colors disabled:opacity-60"
      >
        {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
        {saving ? "Saving…" : "Save"}
      </button>
      <button
        onClick={onCancel}
        disabled={saving}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-60"
      >
        <X size={13} /> Cancel
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const { user, loading } = useCurrentUser();

  console.log("yser data: ", user)

  // Edit states
  const [editingBasic,    setEditingBasic]    = useState(false);
  const [editingContact,  setEditingContact]  = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);

  // Saving states
  const [savingBasic,    setSavingBasic]    = useState(false);
  const [savingContact,  setSavingContact]  = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Drafts — initialised from real user data when editing starts
  const [draftBasic,    setDraftBasic]    = useState({ firstName: "", lastName: "", gender: "", dateOfBirth: "" });
  const [draftContact,  setDraftContact]  = useState({ email: "", phone: "" });
  const [draftPassword, setDraftPassword] = useState({ current: "", newPass: "", confirm: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const userDocRef = () => doc(db, "users", user!.uid);

  const startEditBasic = () => {
    setDraftBasic({
      firstName:   user?.firstName   ?? "",
      lastName:    user?.lastName    ?? "",
      gender:      (user as any)?.gender      ?? "",
      dateOfBirth: (user as any)?.dateOfBirth ?? "",
    });
    setEditingBasic(true);
  };

  const startEditContact = () => {
    setDraftContact({ email: user?.email ?? "", phone: user?.phone ?? "" });
    setEditingContact(true);
  };

  // ── Save handlers ──────────────────────────────────────────────────────────

  const saveBasic = async () => {
    if (!user) return;
    setSavingBasic(true);
    try {
      await updateDoc(userDocRef(), {
        firstName:   draftBasic.firstName.trim(),
        lastName:    draftBasic.lastName.trim(),
        displayName: `${draftBasic.firstName} ${draftBasic.lastName}`.trim(),
        gender:      draftBasic.gender,
        dateOfBirth: draftBasic.dateOfBirth,
        updatedAt:   serverTimestamp(),
      });
      // Keep Firebase Auth displayName in sync
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: `${draftBasic.firstName} ${draftBasic.lastName}`.trim(),
        });
      }
      toast.success("Basic info updated.");
      setEditingBasic(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save. Please try again.");
    } finally {
      setSavingBasic(false);
    }
  };

  const saveContact = async () => {
    if (!user) return;
    setSavingContact(true);
    try {
      await updateDoc(userDocRef(), {
        email:     draftContact.email.trim().toLowerCase(),
        phone:     draftContact.phone.trim(),
        updatedAt: serverTimestamp(),
      });
      toast.success("Contact info updated.");
      setEditingContact(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save. Please try again.");
    } finally {
      setSavingContact(false);
    }
  };

  const savePassword = async () => {
    if (!user || !auth.currentUser) return;

    if (draftPassword.newPass !== draftPassword.confirm) {
      toast.error("New passwords don't match.");
      return;
    }
    if (draftPassword.newPass.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setSavingPassword(true);
    try {
      // Re-authenticate first (required by Firebase before password change)
      const credential = EmailAuthProvider.credential(user.email, draftPassword.current);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, draftPassword.newPass);
      toast.success("Password updated successfully.");
      setDraftPassword({ current: "", newPass: "", confirm: "" });
      setEditingPassword(false);
    } catch (err: any) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        toast.error("Current password is incorrect.");
      } else {
        toast.error("Failed to update password. Please try again.");
      }
    } finally {
      setSavingPassword(false);
    }
  };

  // ── Photo upload ───────────────────────────────────────────────────────────

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !auth.currentUser) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, or WebP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }

    const storage  = getStorage();
    const photoRef = ref(storage, `avatars/${user.uid}`);
    const task     = uploadBytesResumable(photoRef, file);

    task.on(
      "state_changed",
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        setUploadProgress(pct);
      },
      (err) => {
        console.error(err);
        toast.error("Upload failed. Please try again.");
        setUploadProgress(null);
      },
      async () => {
        const downloadURL = await getDownloadURL(task.snapshot.ref);

        // Save to Firestore + Firebase Auth profile
        await updateDoc(userDocRef(), { photoURL: downloadURL, updatedAt: serverTimestamp() });
        await updateProfile(auth.currentUser!, { photoURL: downloadURL });

        toast.success("Profile photo updated!");
        setUploadProgress(null);
        // Clear input so the same file can be re-selected if needed
        e.target.value = "";
      }
    );
  };

  // ── Loading / unauthenticated states ──────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="animate-spin text-[#C9A96E]" size={28} />
      </div>
    );
  }

  if (!user) {
    return <p className="text-sm text-gray-500 p-6">You're not logged in.</p>;
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-gray-800">Personal Details</h1>

      {/* Profile Picture */}
      <SectionCard title="Profile Picture">
        <div className="flex items-center gap-4 sm:gap-5 flex-wrap">
          {/* Avatar */}
          <div className="relative w-16 h-16 shrink-0">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
                  <circle cx="32" cy="24" r="11" fill="#cbd5e1" />
                  <ellipse cx="32" cy="56" rx="20" ry="14" fill="#cbd5e1" />
                </svg>
              )}
            </div>
            {/* Progress ring overlay */}
            {uploadProgress !== null && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">{uploadProgress}%</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadProgress !== null}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#A07840] border border-[#C9A96E]/40 bg-[#C9A96E]/8 hover:bg-[#C9A96E]/15 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploadProgress !== null
                ? <Loader2 size={14} className="animate-spin" />
                : <Camera size={14} />}
              {uploadProgress !== null ? `Uploading ${uploadProgress}%…` : "Upload new photo"}
            </button>
            <p className="text-xs text-gray-400">JPG, PNG or WebP · Max 5MB</p>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
      </SectionCard>

      {/* Basic Information */}
      <SectionCard
        title="Basic Information"
        onEdit={editingBasic ? undefined : startEditBasic}
      >
        {editingBasic && (
          <SaveCancelBar
            onSave={saveBasic}
            onCancel={() => setEditingBasic(false)}
            saving={savingBasic}
          />
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Field label="First Name"    value={draftBasic.firstName}   editing={editingBasic} onChange={(v) => setDraftBasic((d) => ({ ...d, firstName: v }))} />
          <Field label="Last Name"     value={draftBasic.lastName}    editing={editingBasic} onChange={(v) => setDraftBasic((d) => ({ ...d, lastName: v }))} />
          <Field label="Gender"        value={draftBasic.gender}      editing={editingBasic} onChange={(v) => setDraftBasic((d) => ({ ...d, gender: v }))} />
          <Field label="Date of Birth" value={draftBasic.dateOfBirth} editing={editingBasic} onChange={(v) => setDraftBasic((d) => ({ ...d, dateOfBirth: v }))} type="date" />
        </div>
        {/* Display mode: pull from live user data */}
        {!editingBasic && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Field label="First Name"    value={user.firstName} />
            <Field label="Last Name"     value={user.lastName} />
            <Field label="Gender"        value={(user as any).gender      ?? ""} />
            <Field label="Date of Birth" value={(user as any).dateOfBirth ?? ""} />
          </div>
        )}
      </SectionCard>

      {/* Contact Information */}
      <SectionCard
        title="Contact Information"
        onEdit={editingContact ? undefined : startEditContact}
      >
        {editingContact && (
          <SaveCancelBar
            onSave={saveContact}
            onCancel={() => setEditingContact(false)}
            saving={savingContact}
          />
        )}
        {editingContact ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Email Address" value={draftContact.email} editing onChange={(v) => setDraftContact((d) => ({ ...d, email: v }))} type="email" />
            <Field label="Phone Number"  value={draftContact.phone} editing onChange={(v) => setDraftContact((d) => ({ ...d, phone: v }))} type="tel" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Email Address" value={user.email} />
            <Field label="Phone Number"  value={user.phone ? `+${user.dialCode} ${user.phone}` : ""} />
          </div>
        )}
      </SectionCard>

      {/* Change Password */}
      <SectionCard
        title="Change Password"
        onEdit={editingPassword ? undefined : () => setEditingPassword(true)}
      >
        {editingPassword ? (
          <>
            <div className="grid grid-cols-1 gap-4 max-w-sm">
              <Field label="Current Password"     value={draftPassword.current} editing type="password" onChange={(v) => setDraftPassword((d) => ({ ...d, current: v }))} />
              <Field label="New Password"         value={draftPassword.newPass} editing type="password" onChange={(v) => setDraftPassword((d) => ({ ...d, newPass: v }))} />
              <Field label="Confirm New Password" value={draftPassword.confirm} editing type="password" onChange={(v) => setDraftPassword((d) => ({ ...d, confirm: v }))} />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={savePassword}
                disabled={savingPassword}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#C9A96E] text-white hover:bg-[#A07840] transition-colors disabled:opacity-60"
              >
                {savingPassword ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                {savingPassword ? "Updating…" : "Update Password"}
              </button>
              <button
                onClick={() => { setEditingPassword(false); setDraftPassword({ current: "", newPass: "", confirm: "" }); }}
                disabled={savingPassword}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <X size={13} /> Cancel
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400">••••••••••</p>
        )}
      </SectionCard>
    </div>
  );
}
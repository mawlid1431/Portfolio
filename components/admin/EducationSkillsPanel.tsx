"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import AdminModal from "./AdminModal";
import AdminButton from "./AdminButton";
import AdminDeleteConfirmModal from "./AdminDeleteConfirmModal";
import AdminRowActions from "./AdminRowActions";
import { inputClass, labelClass, useAdminTokenHash } from "@/lib/admin-hooks";

type EducationItem = NonNullable<
  ReturnType<typeof useQuery<typeof api.educations.list>>
>[number];

type SkillGroupItem = NonNullable<
  ReturnType<typeof useQuery<typeof api.skills.list>>
>[number];

type EduDraft = {
  title: string;
  org: string;
  period: string;
  text: string;
  sortOrder: number;
};

type SkillDraft = {
  group: string;
  items: string;
  sortOrder: number;
};

const emptyEdu: EduDraft = {
  title: "",
  org: "",
  period: "",
  text: "",
  sortOrder: 0,
};

const emptySkill: SkillDraft = { group: "", items: "", sortOrder: 0 };

type ModalState =
  | { kind: "closed" }
  | { kind: "edu-form"; id: Id<"educations"> | null }
  | { kind: "edu-view"; item: EducationItem }
  | { kind: "skill-form"; id: Id<"skillGroups"> | null }
  | { kind: "skill-view"; item: SkillGroupItem };

type DeleteState =
  | { kind: "none" }
  | { kind: "edu"; item: EducationItem }
  | { kind: "skill"; item: SkillGroupItem };

function ViewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-surface-inner p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--admin-text-faint)]">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-[var(--admin-text)]">
        {value}
      </p>
    </div>
  );
}

export default function EducationSkillsPanel() {
  const tokenHash = useAdminTokenHash();
  const educations = useQuery(
    api.educations.list,
    tokenHash ? { tokenHash } : "skip",
  );
  const skillGroups = useQuery(
    api.skills.list,
    tokenHash ? { tokenHash } : "skip",
  );

  const createEdu = useMutation(api.educations.create);
  const updateEdu = useMutation(api.educations.update);
  const removeEdu = useMutation(api.educations.remove);
  const createSkill = useMutation(api.skills.create);
  const updateSkill = useMutation(api.skills.update);
  const removeSkill = useMutation(api.skills.remove);

  const [modal, setModal] = useState<ModalState>({ kind: "closed" });
  const [eduDraft, setEduDraft] = useState<EduDraft>(emptyEdu);
  const [skillDraft, setSkillDraft] = useState<SkillDraft>(emptySkill);
  const [deleteState, setDeleteState] = useState<DeleteState>({ kind: "none" });
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const closeModal = () => {
    setModal({ kind: "closed" });
    setError("");
  };

  const openEduCreate = () => {
    setEduDraft({ ...emptyEdu, sortOrder: educations?.length ?? 0 });
    setModal({ kind: "edu-form", id: null });
  };

  const openEduEdit = (item: EducationItem) => {
    setEduDraft({
      title: item.title,
      org: item.org,
      period: item.period,
      text: item.text,
      sortOrder: item.sortOrder,
    });
    setModal({ kind: "edu-form", id: item._id });
  };

  const openSkillCreate = () => {
    setSkillDraft({ ...emptySkill, sortOrder: skillGroups?.length ?? 0 });
    setModal({ kind: "skill-form", id: null });
  };

  const openSkillEdit = (item: SkillGroupItem) => {
    setSkillDraft({
      group: item.group,
      items: item.items.join(", "),
      sortOrder: item.sortOrder,
    });
    setModal({ kind: "skill-form", id: item._id });
  };

  const onEduSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tokenHash || modal.kind !== "edu-form") return;
    setError("");
    try {
      if (modal.id) {
        await updateEdu({ tokenHash, educationId: modal.id, ...eduDraft });
      } else {
        await createEdu({ tokenHash, ...eduDraft });
      }
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const onSkillSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tokenHash || modal.kind !== "skill-form") return;
    setError("");
    const payload = {
      group: skillDraft.group,
      items: skillDraft.items
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean),
      sortOrder: skillDraft.sortOrder,
    };
    try {
      if (modal.id) {
        await updateSkill({ tokenHash, skillGroupId: modal.id, ...payload });
      } else {
        await createSkill({ tokenHash, ...payload });
      }
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const confirmDelete = async () => {
    if (!tokenHash || deleteState.kind === "none") return;
    setDeleting(true);
    try {
      if (deleteState.kind === "edu") {
        await removeEdu({ tokenHash, educationId: deleteState.item._id });
      } else {
        await removeSkill({ tokenHash, skillGroupId: deleteState.item._id });
      }
      setDeleteState({ kind: "none" });
      closeModal();
    } finally {
      setDeleting(false);
    }
  };

  if (!tokenHash || educations === undefined || skillGroups === undefined) {
    return <p className="text-sm text-[var(--admin-text-dim)]">Loading…</p>;
  }

  const isEduForm = modal.kind === "edu-form";
  const isSkillForm = modal.kind === "skill-form";

  return (
    <div className="space-y-6">
      {/* ── Education ── */}
      <section className="card-surface card-surface-interactive overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--border-subtle)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <div className="min-w-0">
            <h2 className="font-semibold text-[var(--admin-text)]">
              Education
            </h2>
            <p className="mt-0.5 text-xs text-[var(--admin-text-dim)]">
              Degrees and certificates shown on the about page.
            </p>
          </div>
          <AdminButton
            variant="primary"
            className="!px-3 !py-1.5 !text-xs"
            onClick={openEduCreate}
          >
            Add education
          </AdminButton>
        </div>
        <div className="p-4 sm:p-5">
          {educations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border-subtle)] px-6 py-10 text-center">
              <p className="text-sm font-medium text-[var(--admin-text)]">
                No education entries yet
              </p>
              <p className="mt-2 text-sm text-[var(--admin-text-dim)]">
                The about page shows the built-in list until you add your own.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
              {educations.map((ed) => (
                <article
                  key={ed._id}
                  className="card-surface card-surface-interactive flex h-full flex-col p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 font-semibold text-[var(--admin-text)]">
                      {ed.title}
                    </h3>
                    <span className="inline-flex shrink-0 items-center rounded-full border border-secondary/40 bg-secondary/15 px-2.5 py-0.5 text-xs font-medium text-secondary">
                      {ed.period}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-secondary/90">{ed.org}</p>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-[var(--admin-text-dim)]">
                    {ed.text}
                  </p>
                  <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
                    <AdminRowActions
                      onView={() => setModal({ kind: "edu-view", item: ed })}
                      onEdit={() => openEduEdit(ed)}
                      onDelete={() => setDeleteState({ kind: "edu", item: ed })}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Skills / tech stack ── */}
      <section className="card-surface card-surface-interactive overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--border-subtle)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <div className="min-w-0">
            <h2 className="font-semibold text-[var(--admin-text)]">
              Skills / tech stack
            </h2>
            <p className="mt-0.5 text-xs text-[var(--admin-text-dim)]">
              Grouped skills shown in the tech stack section of the about page.
            </p>
          </div>
          <AdminButton
            variant="primary"
            className="!px-3 !py-1.5 !text-xs"
            onClick={openSkillCreate}
          >
            Add skill group
          </AdminButton>
        </div>
        <div className="p-4 sm:p-5">
          {skillGroups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border-subtle)] px-6 py-10 text-center">
              <p className="text-sm font-medium text-[var(--admin-text)]">
                No skill groups yet
              </p>
              <p className="mt-2 text-sm text-[var(--admin-text-dim)]">
                The about page shows the built-in tech stack until you add your
                own.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
              {skillGroups.map((sg) => (
                <article
                  key={sg._id}
                  className="card-surface card-surface-interactive flex h-full flex-col p-4"
                >
                  <h3 className="font-semibold text-[var(--admin-text)]">
                    {sg.group}
                  </h3>
                  <div className="mt-3 flex flex-1 flex-wrap content-start gap-1.5">
                    {sg.items.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center rounded-full border border-[var(--border-subtle)] px-2.5 py-0.5 text-xs text-[var(--admin-text-dim)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
                    <AdminRowActions
                      onView={() => setModal({ kind: "skill-view", item: sg })}
                      onEdit={() => openSkillEdit(sg)}
                      onDelete={() =>
                        setDeleteState({ kind: "skill", item: sg })
                      }
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Education modal ── */}
      <AdminModal
        open={isEduForm || modal.kind === "edu-view"}
        onClose={closeModal}
        title={
          modal.kind === "edu-view"
            ? "Education details"
            : isEduForm && modal.id
              ? "Edit education"
              : "Add education"
        }
        description={
          modal.kind === "edu-view" ? modal.item.title : undefined
        }
        size="md"
        footer={
          modal.kind === "edu-view" ? (
            <>
              <AdminButton variant="muted" onClick={closeModal}>
                Close
              </AdminButton>
              <AdminButton
                variant="simple"
                onClick={() => openEduEdit(modal.item)}
              >
                Edit
              </AdminButton>
              <AdminButton
                variant="muted"
                className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                onClick={() => setDeleteState({ kind: "edu", item: modal.item })}
              >
                Delete
              </AdminButton>
            </>
          ) : isEduForm ? (
            <>
              <AdminButton variant="muted" onClick={closeModal}>
                Cancel
              </AdminButton>
              <AdminButton variant="primary" type="submit" form="edu-form">
                Save
              </AdminButton>
            </>
          ) : undefined
        }
      >
        {modal.kind === "edu-view" ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <ViewField label="Title" value={modal.item.title} />
              <ViewField label="Organization" value={modal.item.org} />
              <ViewField label="Period" value={modal.item.period} />
            </div>
            <p className="whitespace-pre-wrap text-sm text-[var(--admin-text-dim)]">
              {modal.item.text}
            </p>
          </div>
        ) : isEduForm ? (
          <form id="edu-form" onSubmit={onEduSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Title</label>
                <input
                  className={inputClass}
                  value={eduDraft.title}
                  onChange={(e) =>
                    setEduDraft({ ...eduDraft, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Organization</label>
                <input
                  className={inputClass}
                  value={eduDraft.org}
                  onChange={(e) =>
                    setEduDraft({ ...eduDraft, org: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Period</label>
                <input
                  className={inputClass}
                  placeholder="2023 — 2024"
                  value={eduDraft.period}
                  onChange={(e) =>
                    setEduDraft({ ...eduDraft, period: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                className={inputClass}
                rows={3}
                value={eduDraft.text}
                onChange={(e) =>
                  setEduDraft({ ...eduDraft, text: e.target.value })
                }
                required
              />
            </div>
            <div className="sm:max-w-40">
              <label className={labelClass}>Sort order</label>
              <input
                type="number"
                className={inputClass}
                value={eduDraft.sortOrder}
                onChange={(e) =>
                  setEduDraft({
                    ...eduDraft,
                    sortOrder: Number(e.target.value),
                  })
                }
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </form>
        ) : null}
      </AdminModal>

      {/* ── Skill group modal ── */}
      <AdminModal
        open={isSkillForm || modal.kind === "skill-view"}
        onClose={closeModal}
        title={
          modal.kind === "skill-view"
            ? "Skill group details"
            : isSkillForm && modal.id
              ? "Edit skill group"
              : "Add skill group"
        }
        description={
          modal.kind === "skill-view" ? modal.item.group : undefined
        }
        size="md"
        footer={
          modal.kind === "skill-view" ? (
            <>
              <AdminButton variant="muted" onClick={closeModal}>
                Close
              </AdminButton>
              <AdminButton
                variant="simple"
                onClick={() => openSkillEdit(modal.item)}
              >
                Edit
              </AdminButton>
              <AdminButton
                variant="muted"
                className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                onClick={() =>
                  setDeleteState({ kind: "skill", item: modal.item })
                }
              >
                Delete
              </AdminButton>
            </>
          ) : isSkillForm ? (
            <>
              <AdminButton variant="muted" onClick={closeModal}>
                Cancel
              </AdminButton>
              <AdminButton variant="primary" type="submit" form="skill-form">
                Save
              </AdminButton>
            </>
          ) : undefined
        }
      >
        {modal.kind === "skill-view" ? (
          <div className="space-y-4">
            <ViewField label="Group" value={modal.item.group} />
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--admin-text-faint)]">
                Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {modal.item.items.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full border border-[var(--border-subtle)] px-2.5 py-0.5 text-xs text-[var(--admin-text-dim)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : isSkillForm ? (
          <form
            id="skill-form"
            onSubmit={onSkillSubmit}
            className="flex flex-col gap-4"
          >
            <div>
              <label className={labelClass}>Group name</label>
              <input
                className={inputClass}
                placeholder="Frontend Engineering"
                value={skillDraft.group}
                onChange={(e) =>
                  setSkillDraft({ ...skillDraft, group: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className={labelClass}>Skills (comma-separated)</label>
              <textarea
                className={inputClass}
                rows={3}
                placeholder="TypeScript, React, Next.js"
                value={skillDraft.items}
                onChange={(e) =>
                  setSkillDraft({ ...skillDraft, items: e.target.value })
                }
                required
              />
            </div>
            <div className="sm:max-w-40">
              <label className={labelClass}>Sort order</label>
              <input
                type="number"
                className={inputClass}
                value={skillDraft.sortOrder}
                onChange={(e) =>
                  setSkillDraft({
                    ...skillDraft,
                    sortOrder: Number(e.target.value),
                  })
                }
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </form>
        ) : null}
      </AdminModal>

      <AdminDeleteConfirmModal
        open={deleteState.kind !== "none"}
        entityName={deleteState.kind === "skill" ? "skill group" : "education entry"}
        targetLabel={
          deleteState.kind === "edu"
            ? deleteState.item.title
            : deleteState.kind === "skill"
              ? deleteState.item.group
              : ""
        }
        deleting={deleting}
        onCancel={() => setDeleteState({ kind: "none" })}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}

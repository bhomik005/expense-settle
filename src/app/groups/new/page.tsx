"use client";

import { useState, type FormEvent } from "react";
import {
  isGroupDraftValid,
  normalizeMembers,
  validateGroupDraft,
  type GroupFormErrors,
} from "@/lib/group";

export default function NewGroupPage() {
  const [name, setName] = useState("");
  const [members, setMembers] = useState(["", ""]);
  const [errors, setErrors] = useState<GroupFormErrors>({});
  const [created, setCreated] = useState<{ name: string; members: string[] } | null>(null);

  function updateMember(index: number, value: string) {
    setMembers((current) => current.map((member, i) => (i === index ? value : member)));
  }

  function addMember() {
    setMembers((current) => [...current, ""]);
  }

  function removeMember(index: number) {
    setMembers((current) => current.filter((_, i) => i !== index));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateGroupDraft(name, members);
    setErrors(validationErrors);
    if (isGroupDraftValid(validationErrors)) {
      setCreated({ name: name.trim(), members: normalizeMembers(members) });
    } else {
      setCreated(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 py-16 px-6 dark:bg-black">
      <main className="w-full max-w-md">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Create a group
        </h1>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="group-name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Group name
            </label>
            <input
              id="group-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Trip to Goa"
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "group-name-error" : undefined}
            />
            {errors.name && (
              <p id="group-name-error" className="text-sm text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Members</span>
            <div className="flex flex-col gap-2">
              {members.map((member, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={member}
                    onChange={(event) => updateMember(index, event.target.value)}
                    placeholder={`Member ${index + 1} name`}
                    aria-label={`Member ${index + 1} name`}
                    className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    disabled={members.length <= 2}
                    aria-label={`Remove member ${index + 1}`}
                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addMember}
              className="self-start text-sm font-medium text-zinc-950 underline underline-offset-2 dark:text-zinc-50"
            >
              + Add member
            </button>
            {errors.members && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.members}</p>
            )}
          </div>

          <button
            type="submit"
            className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Create group
          </button>
        </form>

        {created && (
          <div className="mt-8 rounded-md border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
            <p className="font-medium text-black dark:text-zinc-50">
              &ldquo;{created.name}&rdquo; created
            </p>
            <ul className="mt-2 list-inside list-disc text-sm text-zinc-600 dark:text-zinc-400">
              {created.members.map((member) => (
                <li key={member}>{member}</li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

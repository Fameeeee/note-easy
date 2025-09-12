"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { notifyError, notifySuccess } from "@/lib/notify";

type NoteItem = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: { name?: string | null; email: string };
  tags: { tag: { id: string; name: string } }[];
};

function TagChip({ label }: { label: string }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-400/20 text-yellow-700 border border-yellow-300">
      #{label}
    </span>
  );
}

function HomeInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category] = useState("");
  const [sort, setSort] = useState("createdAt-desc");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<NoteItem | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState("");
  const [history, setHistory] = useState<
    Array<{ id: string; title: string; content: string; updatedAt: string }>
  >([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const titleRef = useRef<HTMLInputElement | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [mobileListOpen, setMobileListOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/tags").then(async (res) => {
        if (res.ok) {
          const data: { id: string; name: string }[] = await res.json();
          setAllTags(data.map((t) => t.name));
        }
      });
    }
  }, [status]);

  const fetchNotes = useCallback(async () => {
    const params = new URLSearchParams({
      q: query,
      category: category || "",
      tag: tagFilter || "",
      sort,
      page: String(page),
      pageSize: String(pageSize),
    });
    const res = await fetch(`/api/notes?${params.toString()}`);
    if (!res.ok) return;
    const data = await res.json();
    setNotes(data.items);
    setTotal(data.total);
  }, [query, category, tagFilter, sort, page, pageSize]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotes();
    }
  }, [status, fetchNotes]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [query, tagFilter, sort]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  const onSave = async () => {
    const payload = { id: selected?.id, title, content, tags };
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to save note");
      }
      notifySuccess(selected ? "Note updated" : "Note created");
      setSelected(null);
      setTitle("");
      setContent("");
      setTags([]);
      fetchNotes();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to save note";
      notifyError(message);
    }
  };

  const onSelect = (n: NoteItem) => {
    setSelected(n);
    setTitle(n.title);
    setContent(n.content);
    setTags(n.tags.map((t) => t.tag.name));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <nav className="w-full border-b border-slate-800 bg-slate-950/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden rounded border border-slate-700 px-2 py-1 hover:bg-slate-800"
              onClick={() => setMobileListOpen(true)}
              aria-label="Open notes list"
            >
              Notes
            </button>
            <span className="font-semibold tracking-tight hidden md:inline">Note Easy</span>
          </div>
          <div className="flex items-center gap-3 text-sm opacity-85">
            <span className="opacity-80 hidden sm:inline">
              {session?.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-[30%_70%] gap-4">
        <section className="space-y-3 hidden md:block">
          <div className="sticky top-2 z-10 w-full p-2 rounded border border-slate-800 bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
            <div className="flex gap-2">
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="shrink-0 w-28 md:w-36 bg-slate-900 border border-slate-800 rounded px-3 py-2"
              >
                <option value="">All tags</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>#{t}</option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="shrink-0 w-28 md:w-36 bg-slate-900 border border-slate-800 rounded px-3 py-2"
              >
                <option value="createdAt-desc">Newest</option>
                <option value="createdAt-asc">Oldest</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
              </select>
            </div>
            <div className="mt-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes"
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500/40"
              />
            </div>
          </div>
          <button
            onClick={() => {
              setSelected(null);
              setTitle("");
              setContent("");
              setTags([]);
              setTimeout(() => titleRef.current?.focus(), 0);
            }}
            className="w-full text-left p-3 border-2 border-dashed border-slate-700 rounded hover:border-yellow-500/60 hover:bg-slate-800/40 text-slate-300"
          >
            + New note
          </button>
          <div className="divide-y divide-slate-800 rounded border border-slate-800 overflow-hidden">
            {notes.map((n) => (
              <button
                key={n.id}
                onClick={() => onSelect(n)}
                className={`w-full text-left p-3 hover:bg-slate-800/70 ${
                  selected?.id === n.id ? "bg-slate-800/70" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{n.title}</div>
                  <div className="text-xs opacity-70">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs opacity-80">
                  by {n.author.name || n.author.email}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {n.tags.map(({ tag }) => (
                    <TagChip key={tag.id} label={tag.name} />
                  ))}
                </div>
              </button>
            ))}
            {notes.length === 0 && (
              <div className="p-6 text-center text-sm opacity-70">No notes</div>
            )}
          </div>
          <div className="flex items-center gap-2 justify-between">
            <div className="text-xs opacity-70">
              Page {page} / {totalPages} · {total} items
            </div>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2 py-1 rounded border border-slate-700 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2 py-1 rounded border border-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>
        <section>
          <div className="relative space-y-2">
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              rows={16}
              className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500/40"
            />
            {/* Tag select section: dropdown to pick existing tags plus freeform editor */}
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <select
                  value=""
                  onChange={(e) => {
                    const name = e.target.value;
                    if (!name) return;
                    if (!tags.includes(name)) setTags([...tags, name]);
                    // reset select back to placeholder
                    e.currentTarget.selectedIndex = 0;
                  }}
                  className="bg-slate-900 border border-slate-800 rounded px-3 py-2"
                >
                  <option value="">+ Select tag…</option>
                  {allTags
                    .filter((t) => !tags.includes(t))
                    .map((t) => (
                      <option key={t} value={t}>#{t}</option>
                    ))}
                </select>
              </div>
              <TagEditor tags={tags} setTags={setTags} allTags={allTags} />
            </div>
            <div className="flex gap-2">
              <button
                onClick={onSave}
                disabled={!title.trim()}
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-medium rounded px-3 py-2 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={async () => {
                  if (!selected) return;
                  const sure = window.confirm("Delete this note?");
                  if (!sure) return;
                  try {
                    const res = await fetch(`/api/notes?id=${selected.id}`, { method: "DELETE" });
                    if (!res.ok) {
                      const err = await res.json().catch(() => ({}));
                      throw new Error(err?.error || "Failed to delete note");
                    }
                    notifySuccess("Note deleted");
                    setSelected(null);
                    setTitle("");
                    setContent("");
                    setTags([]);
                    fetchNotes();
                  } catch (e: unknown) {
                    const message = e instanceof Error ? e.message : "Failed to delete note";
                    notifyError(message);
                  }
                }}
                disabled={!selected}
                className="border border-red-600 text-red-400 rounded px-3 py-2 disabled:opacity-50"
              >
                Delete
              </button>
              <button
                onClick={async () => {
                  if (!selected) return;
                  setIsHistoryOpen(true);
                  setIsHistoryLoading(true);
                  const res = await fetch(`/api/notes/history?noteId=${selected.id}`);
                  if (res.ok) setHistory(await res.json());
                  setIsHistoryLoading(false);
                }}
                disabled={!selected}
                className="border border-slate-700 rounded px-3 py-2 disabled:opacity-50"
              >
                History
              </button>
            </div>

            {isHistoryOpen && (
              <div className="absolute inset-y-0 right-0 w-full sm:w-[26rem] md:w-[28rem] lg:w-[30rem] bg-slate-950/95 border-l border-slate-800 shadow-2xl z-20 flex flex-col">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="font-medium">Edit history</div>
                  <button
                    onClick={() => setIsHistoryOpen(false)}
                    className="px-2 py-1 rounded border border-slate-700 hover:bg-slate-900"
                    aria-label="Close history"
                  >
                    Close
                  </button>
                </div>
                <div className="flex-1 overflow-auto">
                  {isHistoryLoading ? (
                    <div className="p-4 text-sm opacity-70">Loading…</div>
                  ) : history.length === 0 ? (
                    <div className="p-4 text-sm opacity-70">No history yet</div>
                  ) : (
                    <div className="divide-y divide-slate-800">
                      {history.map((h) => (
                        <div key={h.id} className="p-4 hover:bg-slate-900/60">
                          <div className="text-xs opacity-70">
                            {new Date(h.updatedAt).toLocaleString()}
                          </div>
                          <div className="font-medium truncate">
                            {h.title || "(untitled)"}
                          </div>
                          <div className="mt-1 text-xs opacity-80 whitespace-pre-wrap">
                            {(h.content || "").slice(0, 200)}{(h.content || "").length > 200 ? "…" : ""}
                          </div>
                          <div className="mt-2">
                            <button
                              onClick={() => {
                                setTitle(h.title);
                                setContent(h.content);
                                setIsHistoryOpen(false);
                              }}
                              className="px-3 py-1 rounded bg-yellow-500 text-slate-900 hover:bg-yellow-400"
                            >
                              Use this version
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {mobileListOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileListOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[92%] max-w-sm bg-slate-950 border-r border-slate-800 p-3 overflow-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Notes</div>
              <button onClick={() => setMobileListOpen(false)} className="px-2 py-1 rounded border border-slate-700 hover:bg-slate-900">Close</button>
            </div>
            <div className="space-y-3">
              <div className="w-full p-2 rounded border border-slate-800 bg-slate-900/80">
                <div className="flex gap-2">
                  <select
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    className="shrink-0 w-28 bg-slate-900 border border-slate-800 rounded px-3 py-2"
                  >
                    <option value="">All tags</option>
                    {allTags.map((t) => (
                      <option key={t} value={t}>#{t}</option>
                    ))}
                  </select>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="shrink-0 w-28 bg-slate-900 border border-slate-800 rounded px-3 py-2"
                  >
                    <option value="createdAt-desc">Newest</option>
                    <option value="createdAt-asc">Oldest</option>
                    <option value="title-asc">Title A-Z</option>
                    <option value="title-desc">Title Z-A</option>
                  </select>
                </div>
                <div className="mt-2">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search notes"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500/40"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  setSelected(null);
                  setTitle("");
                  setContent("");
                  setTags([]);
                  setMobileListOpen(false);
                  setTimeout(() => titleRef.current?.focus(), 0);
                }}
                className="w-full text-left p-3 border-2 border-dashed border-slate-700 rounded hover:border-yellow-500/60 hover:bg-slate-800/40 text-slate-300"
              >
                + New note
              </button>
              <div className="divide-y divide-slate-800 rounded border border-slate-800 overflow-hidden">
                {notes.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => { onSelect(n); setMobileListOpen(false); }}
                    className={`w-full text-left p-3 hover:bg-slate-800/70 ${selected?.id === n.id ? "bg-slate-800/70" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{n.title}</div>
                      <div className="text-xs opacity-70">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-xs opacity-80">by {n.author.name || n.author.email}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {n.tags.map(({ tag }) => (
                        <TagChip key={tag.id} label={tag.name} />
                      ))}
                    </div>
                  </button>
                ))}
                {notes.length === 0 && (
                  <div className="p-6 text-center text-sm opacity-70">No notes</div>
                )}
              </div>
              <div className="flex items-center gap-2 justify-between">
                <div className="text-xs opacity-70">Page {page} / {totalPages} · {total} items</div>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-2 py-1 rounded border border-slate-700 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2 py-1 rounded border border-slate-700 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TagEditor({
  tags,
  setTags,
  allTags,
}: {
  tags: string[];
  setTags: (t: string[]) => void;
  allTags: string[];
}) {
  const [input, setInput] = useState("");
  const add = (raw: string) => {
    const cleaned = raw.trim().replace(/^#+/, "");
    if (!cleaned) return;
    if (!tags.includes(cleaned)) setTags([...tags, cleaned]);
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((t) => (
          <span
            key={t}
            className="px-2 py-0.5 rounded-full text-xs bg-slate-800 border border-slate-700"
          >
            #{t}
            <button
              className="ml-1 opacity-70 hover:opacity-100"
              onClick={() => setTags(tags.filter((x) => x !== t))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "," || e.key === " ") {
              e.preventDefault();
              add(input);
              setInput("");
            }
          }}
          placeholder="#tags"
          className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2"
        />
        <button
          onClick={() => {
            add(input);
            setInput("");
          }}
          className="px-3 rounded border border-slate-700"
        >
          Add
        </button>
      </div>
      {(() => {
        const cleaned = input.trim().replace(/^#+/, "");
        const cleanedLower = cleaned.toLowerCase();
        const chosen = new Set(tags.map((t) => t.toLowerCase()));
        const suggestions = allTags
          .filter((t) => t.toLowerCase().includes(cleanedLower) && !chosen.has(t.toLowerCase()))
          .slice(0, 8);
        const exactExists = allTags.some((t) => t.toLowerCase() === cleanedLower);
        const showCreate = cleaned.length > 0 && !chosen.has(cleanedLower) && !exactExists;
        if (!cleaned && suggestions.length === 0) return null;
        return (
          <div className="mt-2 border border-slate-800 rounded p-2 bg-slate-900/60">
            {suggestions.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {suggestions.map((t) => (
                  <button
                    key={t}
                    onClick={() => add(t)}
                    className="px-2 py-0.5 rounded-full text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700"
                    title={`Use #${t}`}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            )}
            {showCreate && (
              <button
                onClick={() => { add(cleaned); setInput(""); }}
                className="text-left w-full px-2 py-1 rounded border border-slate-700 hover:bg-slate-800 text-sm"
              >
                Create #{cleaned}
              </button>
            )}
          </div>
        );
      })()}
    </div>
  );
}

export default function Home() {
  return (
    <SessionProvider>
      <HomeInner />
    </SessionProvider>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StickyNote, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function NotesPage() {
  const [notes, setNotes] = useState<{ id: string, title?: string, text: string, date: string }[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("wealthwise_notes");
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveNotes = (newNotes: any) => {
    setNotes(newNotes);
    localStorage.setItem("wealthwise_notes", JSON.stringify(newNotes));
  };

  const createNote = () => {
    const newNote = { id: Date.now().toString(), title: "", text: "", date: new Date().toISOString() };
    saveNotes([newNote, ...notes]);
    setActiveNote(newNote.id);
  };

  const updateNoteText = (id: string, text: string) => {
    const updated = notes.map(n => n.id === id ? { ...n, text, date: new Date().toISOString() } : n);
    saveNotes(updated);
  };

  const updateNoteTitle = (id: string, title: string) => {
    const updated = notes.map(n => n.id === id ? { ...n, title, date: new Date().toISOString() } : n);
    saveNotes(updated);
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    saveNotes(updated);
    if (activeNote === id) setActiveNote(null);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <StickyNote className="h-8 w-8 text-yellow-500" /> Executive Notes
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Personal scratchpad and strategic reflections.</p>
        </div>
        <Button onClick={createNote} className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border border-yellow-500/50">
          <Plus className="h-4 w-4 mr-2" /> New Note
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          {notes.length === 0 ? (
             <div className="text-slate-500 italic text-sm p-4 bg-white/5 rounded-xl border border-white/10 text-center">No notes yet. Create one to start.</div>
          ) : (
            notes.map(note => (
              <div 
                key={note.id} 
                onClick={() => setActiveNote(note.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${activeNote === note.id ? 'bg-yellow-500/10 border-yellow-500/30 text-white' : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5'}`}
              >
                <div className="text-xs text-slate-500 mb-2">{new Date(note.date).toLocaleString()}</div>
                <div className="truncate text-sm font-medium">{note.title || (note.text ? note.text.substring(0, 30) : 'Untitled Note...')}</div>
              </div>
            ))
          )}
        </div>
        
        <div className="md:col-span-2">
          {activeNote ? (
            <div className="bento-card p-0 flex flex-col h-[600px] border border-white/10 rounded-xl overflow-hidden bg-[#0A0F1C]">
              <div className="bg-black/40 p-3 border-b border-white/10 flex justify-between items-center">
                <input 
                  type="text"
                  placeholder="Note Title..."
                  className="bg-transparent text-white font-bold ml-2 focus:outline-none flex-1 text-base placeholder:text-slate-600"
                  value={notes.find(n => n.id === activeNote)?.title || ""}
                  onChange={(e) => updateNoteTitle(activeNote, e.target.value)}
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 ml-4 shrink-0">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#0A0F1C] border border-white/10 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-400">
                        This action cannot be undone. This will permanently delete this note.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteNote(activeNote)} className="bg-rose-500 hover:bg-rose-600 text-white border-0">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <textarea 
                className="flex-1 w-full bg-transparent text-slate-200 p-6 resize-none focus:outline-none custom-scrollbar leading-relaxed"
                placeholder="Start typing your strategic thoughts here..."
                value={notes.find(n => n.id === activeNote)?.text || ""}
                onChange={(e) => updateNoteText(activeNote, e.target.value)}
              />
            </div>
          ) : (
             <div className="h-[600px] border border-white/5 border-dashed rounded-xl flex items-center justify-center text-slate-500 bg-white/5">
                Select or create a note to edit.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

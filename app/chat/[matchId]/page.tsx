"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Gift,
  HeartOff,
  Send,
  Smile,
  Sparkles,
  Volume2,
  Wand2,
} from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CatAvatar } from "@/components/catmate/CatAvatar";
import { MessageBubble, TypingDots } from "@/components/catmate/ChatBubbles";
import { EmptyState } from "@/components/catmate/Bits";
import { useCatMate } from "@/lib/store";
import { getCatById } from "@/lib/mock/cats";
import { avatarFromCat } from "@/lib/avatar";
import { fromMeow, looksLikeMeow, toMeow } from "@/lib/meow";
import { DATE_ACTIVITIES, GIFTS, STICKERS } from "@/lib/mock/replies";
import { matchCompatibility, stageProgress } from "@/lib/compat";
import { fetchReply, postDate, postGift } from "@/lib/api";
import { playMeow, playPop, playPurr, playSend } from "@/lib/sound";
import { speakMeow, stopSpeaking } from "@/lib/tts";
import { STAGE_META } from "@/lib/types";
import type { GiftId } from "@/lib/types";

const ICEBREAKERS = [
  "Hi! I heard you like tuna… 🐟",
  "What's your favorite sunbeam spot?",
  "I brought you a leaf. It's a gift. 🍃",
  "Rate my nap technique: 10/10?",
  "If you were a snack, what snack would you be?",
  "Wanna knock things off a table together?",
];

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ChatPage() {
  const params = useParams<{ matchId: string }>();
  const router = useRouter();
  const matchId = params.matchId;

  const hydrated = useCatMate((s) => s.hydrated);
  const matches = useCatMate((s) => s.matches);
  const profile = useCatMate((s) => s.profile);
  const appendMessage = useCatMate((s) => s.appendMessage);
  const markRead = useCatMate((s) => s.markRead);
  const bumpAffection = useCatMate((s) => s.bumpAffection);
  const setMatchDate = useCatMate((s) => s.setMatchDate);
  const setNightOwl = useCatMate((s) => s.setNightOwl);
  const removeMatch = useCatMate((s) => s.removeMatch);

  const match = matches.find((m) => m.id === matchId) ?? null;
  const cat = match ? getCatById(match.catId) : undefined;
  const avatar = cat ? avatarFromCat(cat) : null;

  const [input, setInput] = useState("");
  const [meowMode, setMeowMode] = useState(false); // display language
  const [composerMeow, setComposerMeow] = useState(false); // type in meow
  const [typing, setTyping] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const greetedRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const messages = useMemo(() => match?.messages ?? [], [match]);

  // Mark read on open
  useEffect(() => {
    if (match) markRead(match.id);
  }, [match, markRead]);

  // Night owl tracking
  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 0 && h < 5) setNightOwl(true);
  }, [setNightOwl]);

  // Stop any cat voice when leaving the chat
  useEffect(() => () => stopSpeaking(), []);

  // Cat greeting when a fresh match has no messages
  useEffect(() => {
    if (!match || !cat || greetedRef.current) return;
    if (match.messages.length === 0) {
      greetedRef.current = true;
      const text =
        cat.voice === "shy"
          ? `oh… hi. i'm ${cat.name}. you meowed at me… that's nice.`
          : cat.voice === "grumpy"
            ? `So you're the one who catnip'd me. I'm ${cat.name}. Impress me.`
            : cat.voice === "dramatic"
              ? `At last! A match! I am ${cat.name}, and I have been waiting.`
              : `Hi! I'm ${cat.name}. Wanna chat? I'm very good at it.`;
      appendMessage(match.id, {
        id: newId(),
        matchId: match.id,
        sender: "cat",
        text,
        meow: toMeow(text),
        kind: "text",
        createdAt: Date.now(),
        read: true,
      });
    }
  }, [match, cat, appendMessage]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, typing]);

  const preview = useMemo(() => {
    const t = input.trim();
    if (!t) return "";
    return composerMeow ? fromMeow(t) : toMeow(t);
  }, [input, composerMeow]);

  const send = useCallback(
    async (raw: string) => {
      if (!match || !cat) return;
      const value = raw.trim();
      if (!value || busy) return;

      const humanText = composerMeow ? fromMeow(value) : value;
      const meowText = composerMeow ? value : toMeow(value);

      appendMessage(match.id, {
        id: newId(),
        matchId: match.id,
        sender: "me",
        text: humanText,
        meow: meowText,
        kind: "text",
        createdAt: Date.now(),
        read: false,
      });
      setInput("");
      playSend();
      bumpAffection(match.id, 2);
      setBusy(true);
      setTyping(true);

      try {
        const reply = await fetchReply(
          cat.id,
          humanText,
          match.messages.length + 1
        );
        appendMessage(match.id, {
          id: newId(),
          matchId: match.id,
          sender: "cat",
          text: reply.text,
          meow: reply.meow,
          kind: "text",
          createdAt: Date.now(),
          read: true,
        });
        playMeow();
      } catch {
        toast.error("The cat wandered off mid-sentence. Try again.");
      } finally {
        setTyping(false);
        setBusy(false);
      }
    },
    [appendMessage, bumpAffection, busy, cat, composerMeow, match]
  );

  const sendSticker = useCallback(
    (emoji: string) => {
      if (!match || busy) return;
      appendMessage(match.id, {
        id: newId(),
        matchId: match.id,
        sender: "me",
        text: `sent a sticker`,
        meow: emoji,
        kind: "sticker",
        sticker: emoji,
        createdAt: Date.now(),
        read: false,
      });
      playPop();
      setToolsOpen(false);
      bumpAffection(match.id, 1);
    },
    [appendMessage, bumpAffection, match, busy]
  );

  const sendGift = useCallback(
    async (giftId: GiftId) => {
      if (!match || !cat || busy) return;
      const gift = GIFTS.find((g) => g.id === giftId);
      if (!gift) return;
      appendMessage(match.id, {
        id: newId(),
        matchId: match.id,
        sender: "me",
        text: `You sent ${gift.label}`,
        meow: toMeow(`You sent ${gift.label}`),
        kind: "gift",
        gift: giftId,
        createdAt: Date.now(),
        read: false,
      });
      setToolsOpen(false);
      playSend();
      bumpAffection(match.id, gift.affection);
      setBusy(true);
      try {
        const res = await postGift(cat.id, giftId);
        appendMessage(match.id, {
          id: newId(),
          matchId: match.id,
          sender: "cat",
          text: res.reaction.text,
          meow: res.reaction.meow,
          kind: "text",
          createdAt: Date.now(),
          read: true,
        });
        playPurr();
      } catch {
        toast.error("The gift got stuck in the cat flap.");
      } finally {
        setBusy(false);
      }
    },
    [appendMessage, bumpAffection, cat, match, busy]
  );

  const planDate = useCallback(
    async (activityId: string) => {
      if (!match || !cat || busy) return;
      const activity = DATE_ACTIVITIES.find((a) => a.id === activityId);
      if (!activity) return;
      setToolsOpen(false);
      setBusy(true);
      setTyping(true);
      try {
        const date = await postDate(cat.id, activityId);
        setMatchDate(match.id, date);
        appendMessage(match.id, {
          id: newId(),
          matchId: match.id,
          sender: "me",
          text: date.story,
          meow: toMeow(date.story),
          kind: "date",
          sticker: date.emoji,
          createdAt: Date.now(),
          read: false,
        });
        appendMessage(match.id, {
          id: newId(),
          matchId: match.id,
          sender: "cat",
          text: date.reaction,
          meow: toMeow(date.reaction),
          kind: "text",
          createdAt: Date.now() + 1,
          read: true,
        });
        bumpAffection(match.id, 10);
        playPurr();
        toast.success(`${date.emoji} ${date.activity} booked!`, {
          description: "A lovely Cat Café date awaits.",
        });
      } catch {
        toast.error("Couldn't book the date. The café is full of cats.");
      } finally {
        setTyping(false);
        setBusy(false);
      }
    },
    [appendMessage, bumpAffection, cat, match, setMatchDate, busy]
  );

  if (hydrated && !match) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg items-center px-4">
        <EmptyState
          className="w-full"
          emoji="🙀"
          title="This match vanished"
          description="It may have been unmasked or blocked. Let's find you another cutie."
          action={
            <Button asChild className="rounded-full">
              <Link href="/matches">Back to matches</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (!match || !cat || !avatar) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg items-center px-4">
        <div className="h-24 w-full animate-pulse rounded-3xl bg-card" />
      </div>
    );
  }

  const stage = stageProgress(match.messages.length);
  const showIcebreakers = match.messages.length <= 1;

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back"
            className="rounded-full"
            onClick={() => router.push("/matches")}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="size-10 shrink-0 overflow-hidden rounded-2xl ring-2 ring-primary/20">
              <CatAvatar
                fur={avatar.fur}
                pattern={avatar.pattern}
                eyes={avatar.eyes}
                accessory={avatar.accessory}
                size={40}
                className="h-full w-full"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate font-heading text-base font-semibold leading-tight">
                {cat.name}
              </p>
              <p className="flex items-center gap-1 truncate text-[0.7rem] text-muted-foreground">
                <span>
                  {STAGE_META[stage.stage].emoji}{" "}
                  {STAGE_META[stage.stage].label}
                </span>
                <span className="opacity-60">·</span>
                <span className="inline-flex items-center gap-0.5 text-primary">
                  <Sparkles className="size-3" />
                  {matchCompatibility(profile, cat, match.compatibility)}%
                </span>
              </p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Unmatch"
                className="rounded-full text-muted-foreground"
              >
                <HeartOff className="size-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Hiss off {cat.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes the match and your conversation with {cat.name}.
                  It cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full">
                  Keep chatting
                </AlertDialogCancel>
                <AlertDialogAction
                  className="rounded-full"
                  onClick={() => {
                    removeMatch(match.id);
                    toast("Hissed off 😾", {
                      description: `${cat.name} has been removed from your matches.`,
                    });
                    router.push("/matches");
                  }}
                >
                  Unmatch
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Purr meter */}
        <div className="mx-auto w-full max-w-2xl px-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[0.65rem] font-medium text-muted-foreground">
              💜 Purr meter
            </span>
            <Progress value={stage.progress * 100} className="h-1.5 flex-1" />
            <span className="text-[0.65rem] text-muted-foreground">
              {stage.next
                ? `${STAGE_META[stage.next].emoji} ${Math.round(stage.progress * 100)}%`
                : "💍 Soulmate!"}
            </span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div
        role="log"
        aria-live="polite"
        aria-label={`Conversation with ${cat.name}`}
        className="mx-auto w-full max-w-2xl flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        <div className="mx-auto mb-2 w-fit rounded-full bg-muted px-3 py-1 text-center text-[0.7rem] text-muted-foreground">
          You matched with {cat.name}. Be yourself… or a cat. 🐾
        </div>

        {match.date && (
          <div className="mx-auto mb-2 w-fit rounded-full bg-catnip/12 px-3 py-1 text-[0.7rem] font-medium text-catnip">
            {match.date.emoji} Upcoming date: {match.date.activity}
          </div>
        )}

        {messages.map((m, i) => (
          <MessageBubble
            key={m.id}
            message={m}
            meowMode={meowMode}
            onSpeak={(msg) => speakMeow(msg.text, msg.meow)}
            showReceipt={m.sender === "me" && i === messages.length - 1}
          />
        ))}

        {typing && (
          <div className="flex justify-start">
            <TypingDots meow={meowMode} />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Icebreakers */}
      {showIcebreakers && (
        <div className="mx-auto w-full max-w-2xl px-4 pb-2">
          <p className="mb-1.5 text-[0.7rem] font-medium text-muted-foreground">
            Need an opener? Try one:
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {ICEBREAKERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setInput(s)}
                className="shrink-0 rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="sticky bottom-0 z-30 border-t border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-2xl px-3 py-2.5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="inline-flex rounded-full bg-muted p-0.5 text-xs">
              <button
                type="button"
                aria-pressed={!meowMode}
                onClick={() => setMeowMode(false)}
                className={cn(
                  "rounded-full px-2.5 py-1 font-medium transition-colors",
                  !meowMode ? "bg-background shadow-sm" : "text-muted-foreground"
                )}
              >
                🧑 Human
              </button>
              <button
                type="button"
                aria-pressed={meowMode}
                onClick={() => setMeowMode(true)}
                className={cn(
                  "rounded-full px-2.5 py-1 font-medium transition-colors",
                  meowMode ? "bg-background shadow-sm" : "text-muted-foreground"
                )}
              >
                🐱 Meow
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-pressed={composerMeow}
                onClick={() => setComposerMeow((v) => !v)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  composerMeow
                    ? "border-catnip bg-catnip/15 text-catnip"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
                title="Type in Meow, send in Human"
              >
                <Wand2 className="size-3.5" />
                {composerMeow ? "Meow in" : "Human in"}
              </button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Hear meowed"
                className="rounded-full text-muted-foreground"
                onClick={() => speakMeow("meow meow", "meow meow")}
              >
                <Volume2 className="size-4" />
              </Button>
            </div>
          </div>

          {preview && (
            <div className="mb-1.5 rounded-xl bg-muted/70 px-3 py-1.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {composerMeow ? "Translation: " : "They'll read: "}
              </span>
              {preview}
            </div>
          )}

          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <Sheet open={toolsOpen} onOpenChange={setToolsOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Chat tools"
                  className="shrink-0 rounded-full"
                >
                  <Smile className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="mx-auto max-w-2xl rounded-t-[2rem] px-5 pb-8"
              >
                <SheetHeader className="px-0">
                  <SheetTitle className="font-heading">
                    Cat tools 🧰
                  </SheetTitle>
                </SheetHeader>
                <Tabs defaultValue="stickers">
                  <TabsList className="w-full rounded-full">
                    <TabsTrigger value="stickers">Stickers</TabsTrigger>
                    <TabsTrigger value="gifts">Gifts</TabsTrigger>
                    <TabsTrigger value="dates">Dates</TabsTrigger>
                  </TabsList>

                  <TabsContent value="stickers" className="pt-3">
                    <div className="grid grid-cols-4 gap-2">
                      {STICKERS.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => sendSticker(s.emoji)}
                          className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card py-3 transition-transform hover:scale-105"
                        >
                          <span className="text-3xl">{s.emoji}</span>
                          <span className="text-[0.65rem] text-muted-foreground">
                            {s.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="gifts" className="pt-3">
                    <div className="grid grid-cols-3 gap-2">
                      {GIFTS.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => void sendGift(g.id)}
                          className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card py-3 transition-transform hover:scale-105"
                        >
                          <span className="text-3xl">{g.emoji}</span>
                          <span className="text-[0.65rem] font-medium">
                            {g.label}
                          </span>
                          <span className="text-[0.6rem] text-primary">
                            +{g.affection} 💜
                          </span>
                        </button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="dates" className="pt-3">
                    <div className="grid gap-2">
                      {DATE_ACTIVITIES.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => void planDate(a.id)}
                          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-catnip/40 hover:bg-catnip/8"
                        >
                          <span className="text-2xl">{a.emoji}</span>
                          <span className="text-sm font-medium">{a.label}</span>
                          <Gift className="ml-auto size-4 text-catnip" />
                        </button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </SheetContent>
            </Sheet>

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                composerMeow ? "mrrp meow prrr…" : `Message ${cat.name}…`
              }
              className="h-11 flex-1 rounded-full"
              aria-label="Message"
              maxLength={500}
            />

            <Button
              type="submit"
              size="icon"
              aria-label="Send"
              disabled={!input.trim() || busy}
              className="shrink-0 rounded-full fluffy-shadow-soft"
            >
              <Send className="size-5" />
            </Button>
          </form>

          {composerMeow && input.trim() && looksLikeMeow(input) && (
            <p className="mt-1 px-1 text-[0.65rem] text-catnip">
              🐱 Nice meow. Sending the translation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

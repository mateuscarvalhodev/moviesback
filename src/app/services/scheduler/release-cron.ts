// src/scheduler/release-cron.ts
import cron from "node-cron";
import { PrismaClient } from "@prisma/client";

import { sendEmail } from "../mail/index.js";
import { chunk, todayRangeUTC_BR } from "../../../utils/index.js";
import { prisma } from "../../../infra/db/prisma.js";

const BCC_BATCH_SIZE = 100;

cron.schedule("*/2 * * * *", async () => {
  const { startUTC, endUTC } = todayRangeUTC_BR();

  const movies = await prisma.movie.findMany({
    where: {
      mailSent: false,
      releaseDate: { gte: startUTC, lt: endUTC },
    },
    select: { id: true, title: true },
    take: 500,
  });
  console.log({ movies });

  if (movies.length === 0) return;

  const users = await prisma.user.findMany({
    select: { email: true },
  });
  const allEmails = users.map((u) => u.email!).filter(Boolean);
  const batches = chunk(allEmails, BCC_BATCH_SIZE);

  for (const m of movies) {
    const { count } = await prisma.movie.updateMany({
      where: { id: m.id, mailSent: false },
      data: { mailSent: true },
    });

    if (count !== 1) {
      continue;
    }

    try {
      let i = 0;
      for (const bcc of batches) {
        i++;
        if (!bcc.length) break;

        await sendEmail({
          to: "no-reply@localhost",
          bcc,
          subject: `🎬 Estreou: ${m.title}`,
          html: `<h1>${m.title}</h1><p>O filme estreia hoje!</p>`,
          text: `Estreou: ${m.title}`,
          headers: {
            "X-Movie-Id": m.id,
            "X-Movie-Title": m.title,
            "X-Batch": String(i),
          },
        });
      }

      console.log(
        `[broadcast] SENT movie=${m.id} title="${m.title}" recipients=${allEmails.length}`
      );
    } catch (err) {
      await prisma.movie.update({
        where: { id: m.id },
        data: { mailSent: false },
      });
      console.error(
        `[broadcast] FAILED movie=${m.id} title="${m.title}" err=${(err as Error).message}`
      );
    }
  }
});

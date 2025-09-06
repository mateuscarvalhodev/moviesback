import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const genres = [
    { name: "Action" },
    { name: "Adventure" },
    { name: "Animation" },
    { name: "Biography" },
    { name: "Comedy" },
    { name: "Crime" },
    { name: "Documentary" },
    { name: "Drama" },
    { name: "Family" },
    { name: "Fantasy" },
    { name: "History" },
    { name: "Horror" },
    { name: "Music" },
    { name: "Musical" },
    { name: "Mystery" },
    { name: "Romance" },
    { name: "Science Fiction" },
    { name: "Sport" },
    { name: "Thriller" },
    { name: "War" },
    { name: "Western" },
  ];

  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { name: genre.name },
      update: {},
      create: genre,
    });
  }

  const studios = [
    { name: "Walt Disney Studios" },
    { name: "Warner Bros. Pictures" },
    { name: "Universal Pictures" },
    { name: "Sony Pictures Entertainment" },
    { name: "Paramount Pictures" },
    { name: "20th Century Studios" },
    { name: "Metro-Goldwyn-Mayer" },
    { name: "Lionsgate" },

    { name: "Marvel Studios" },
    { name: "Lucasfilm" },
    { name: "Pixar Animation Studios" },
    { name: "Walt Disney Animation Studios" },

    { name: "DC Films" },
    { name: "New Line Cinema" },
    { name: "Castle Rock Entertainment" },

    { name: "Focus Features" },
    { name: "Illumination" },
    { name: "DreamWorks Pictures" },
    { name: "DreamWorks Animation" },

    { name: "Columbia Pictures" },
    { name: "Sony Pictures Animation" },
    { name: "Screen Gems" },

    { name: "A24" },
    { name: "Searchlight Pictures" },
    { name: "Neon" },
    { name: "IFC Films" },
    { name: "The Weinstein Company" },
    { name: "Miramax" },
    { name: "Blumhouse Productions" },
    { name: "Netflix" },
    { name: "Amazon Studios" },
    { name: "Apple Studios" },

    { name: "Studio Ghibli" },
    { name: "Toei Animation" },
    { name: "Madhouse" },
    { name: "Pathé" },
    { name: "StudioCanal" },
    { name: "Working Title Films" },
    { name: "Legendary Entertainment" },
    { name: "Plan B Entertainment" },
    { name: "Annapurna Pictures" },

    { name: "RKO Pictures" },
    { name: "United Artists" },
    { name: "Orion Pictures" },
    { name: "Carolco Pictures" },

    { name: "Blue Sky Studios" },
    { name: "Laika" },
    { name: "Aardman Animations" },

    { name: "Hammer Film Productions" },
    { name: "Dimension Films" },

    { name: "Hulu Originals" },
    { name: "HBO Films" },
    { name: "Showtime Films" },
  ];

  for (const studio of studios) {
    await prisma.studio.upsert({
      where: { name: studio.name },
      update: {},
      create: studio,
    });
  }

  const users = [
    {
      email: "z.mateusc@gmail.com",
      passwordHash:
        "$argon2id$v=19$m=65536,t=3,p=4$TD4RWeXei2hDvMDEkdtC+Q$eLPKGIvlNZzg/pJuneNN4uIP30cvzPDzOuqapHmdlPk",
      name: "Mateus Carvalho",
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

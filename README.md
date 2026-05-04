# NotesFlix — Knowledge Discovery

Upload your notes or lecture materials and get a personalized Netflix-style feed of resources tailored to what you're studying. Powered by Groq (Llama 3.3 70B), GitHub, YouTube, HackerNews, and arXiv.

---

## Full Functionality Breakdown

### Core Concept
Upload your notes or lecture materials → AI extracts what you're studying → the app fetches real resources from across the web and surfaces them in a Netflix-style feed, personalized to your content.

---

### Sidebar — Note Management

**Add Notes (two ways):**
- **Text tab** — paste a title and raw text content (lecture notes, study material, anything)
- **Upload tab** — drag-and-drop or browse for `.pdf` or `.txt` files. PDFs are parsed and text extracted automatically

**Notes List:**
- All notes persist in a local SQLite database between sessions
- Each note card shows: title, file type icon (PDF vs text), a preview of the content, extracted concept tags, how long ago it was added, and how many resources were found
- While Groq is still processing a new note, it shows "Analyzing concepts..." — once done, the concept badges appear automatically (polls every 5 seconds)
- Trash icon on each card to delete a note and all its associated resources

---

### Main Panel — Two Tabs

#### Discovery Feed Tab
- Aggregated Netflix/TikTok-style grid of all resources across all your notes
- Filter buttons: **All / GitHub / YouTube / Articles**
- Resources are sorted by relevance score
- Refresh button to reload
- Empty state with instructions when no notes exist yet

#### Note Resources Tab
- Click any note in the sidebar to open its dedicated resource view
- Shows the **Key Concepts** badges extracted by Groq (or a loading spinner while processing)
- Shows a preview of the note content
- Resources broken into three sections:
  - **GitHub Projects** — real repos sorted by stars
  - **YouTube Tutorials** — actual video results with thumbnails
  - **Articles & Papers** — HackerNews stories + arXiv academic papers
- Polls every 3 seconds after a note is selected until concepts and resources appear

---

### AI Pipeline (Groq / Llama 3.3 70B)

When a note is added, the app runs in the background (non-blocking, so the UI is instant):
1. Sends the note title + content to Groq
2. Extracts: **5–10 key concepts**, a summary, **3–5 broader topics**, difficulty level, and **targeted search queries** for GitHub, YouTube, and articles
3. Uses those queries to fetch resources from all four sources in parallel

---

### Resource Sources

| Source | API | What it fetches |
|---|---|---|
| **GitHub** | GitHub REST API (free, no key) | Repos matching the note's topics, sorted by stars |
| **YouTube** | YouTube Data API v3 | Tutorial videos matching the note's concepts |
| **Hacker News** | Algolia HN API (free) | Top-voted stories on the topic |
| **arXiv** | arXiv API (free) | Academic papers on the subject |

---

### Semantic Deep Linking
The codebase includes `generateSemanticLinks()` — a Groq call that scores how related two sets of concepts are (0–1), accounting for synonyms and related domains, not just keyword overlap. This powers cross-note thematic connections.

---

### Data Persistence
- **SQLite** database via Prisma + libsql adapter
- Three tables: `Note`, `Recommendation` (per-note resources), `FeedItem` (global feed entries)
- All data survives server restarts — notes, concepts, and recommendations are stored permanently

---

### UI / Design
- Dark Netflix-inspired theme (deep navy/black background, red-orange primary accent)
- Resource cards animate on hover (lift + scale)
- Source badges color-coded: GitHub (slate), YouTube (red), HackerNews (orange), arXiv (blue)
- YouTube cards show actual video thumbnails
- GitHub cards show the repo owner's avatar
- Fully responsive grid (1 → 2 → 3 columns)

---

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** SQLite via Prisma + libsql adapter
- **AI:** Groq API (Llama 3.3 70B)
- **PDF parsing:** pdfjs-dist

---

## How to Run

### 1. Clone the repo

```bash
git clone https://github.com/itsWass/cs485-personal-notes.git
cd cs485-personal-notes
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project:

```env
DATABASE_URL="file:./dev.db"
GROQ_API_KEY="your_groq_api_key"
YOUTUBE_API_KEY="your_youtube_api_key"
```

- **Groq API key** — free at [console.groq.com](https://console.groq.com)
- **YouTube Data API v3 key** — free at [Google Cloud Console](https://console.cloud.google.com) (enable YouTube Data API v3, then create an API key under Credentials)

### 4. Set up the database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

1. **Add a note** — paste text in the sidebar or upload a `.pdf` / `.txt` file
2. **Wait ~15 seconds** — Groq extracts concepts and resources are fetched in the background
3. **Check the Discovery Feed** — browse GitHub repos, YouTube tutorials, and articles across all your notes
4. **Click a note** — view its specific resources broken down by source

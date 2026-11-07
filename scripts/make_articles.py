"""Turn Agboola Abigail's article documents into src/content/articles.json.

usage: python3 make_articles.py <articles.md> <out.json>
Titles and themes are provisional, written for the site, for the author to approve.
None = left out (a duplicate, or held back until confirmed).
"""
import json, re, sys

T = [  # (title, theme) in document order
 ("From object of sin to servant", "Holiness"),
 ("Can the Lord bear witness to you?", "Accountability"),
 ("Serving God His way", "Service"),
 ("The harp at hand", "Service"),
 ("Seeds", "Holiness"),
 ("Bring down the high places", "Idols"),
 ("Shift our desires", "Devotion"),
 ("The uncircumcised flesh", "Holiness"),
 ("What is truly boring", "Worship"),
 ("The disease under the clothing", "Salvation"),
 ("“Lord, help me”", "Prayer"),
 ("Oh, you slothful one", "Urgency"),
 ("Rapture is nearer", "Watchfulness"),
 ("Freedom at the exodus", "Salvation"),
 ("There is still space in the ark", "Salvation"),
 ("Pay attention to details", "The Word"),
 ("The seed of fear", "Faith"),
 ("For the girl behind the camera", "Purity"),
 ("Count the cost of freedom", "Salvation"),
 ("Come back home", "Salvation"),
 ("Into battle with faith", "Faith"),
 ("Idols that do not glitter", "Idols"),
 ("A living sacrifice", "Consecration"),
 ("Seek Him first", "Devotion"),
 ("Love that comes from knowing", "The Word"),
 ("Your own roots", "The Word"),
 ("Light is loud", "Holiness"),
 ("The aesthetic king", "Worldliness"),
 ("Don't be another yoke", "Christlikeness"),
 ("Faith beyond letters", "Faith"),
 ("Go beyond the congregation", "Evangelism"),
 ("A new heart", "Holiness"),
 ("The vessel carrying the light", "Christlikeness"),
 ("It's messy out there", "Holiness"),
 ("Leadership without the sacrifice?", "Leadership"),
 ("To and fro, going nowhere", "Focus"),
 ("Go back to the secret place", "Devotion"),
 ("Not minding my business", "Accountability"),
 ("Your stronghold", "Devotion"),
 ("What is your Baal?", "Idols"),
 ("Fed on awful things", "The Word"),
 ("Your body, His temple", "Holiness"),
 ("Stop personalising experience", "Faith"),
 ("Just a reminder", "Purity"),
 ("Disciplined for what?", "Discipline"),
 ("Find your way back", "Salvation"),
 ("Don't settle for consultation", "Devotion"),
 ("Why you need Jesus", "Salvation"),
 ("Until you meet the cross", "Salvation"),
 ("Chasing validation", "Identity"),
 ("The forgotten sword", "Devotion"),
 ("He never left", "Devotion"),
 ("A responsible child", "Faith"),
 None,  # "A secret sin…": different voice, held back until authorship is confirmed
 ("Seeking the means, not the Source", "Devotion"),
 ("The entrance of the Word", "The Word"),
 ("The yellow flower", "Devotion"),
 ("Never look at your inadequacy", "Identity"),
 None,  # duplicate of "Seeds"
 ("The adequate Christ", "Identity"),
 None,  # duplicate of "Can the Lord bear witness to you?"
 None,  # duplicate of "The harp at hand"
 ("Do you know Him?", "Devotion"),
 None,  # duplicate of "Can the Lord bear witness to you?"
 ("Contentment in a few words", "Contentment"),
 ("A life that becomes yours", "Salvation"),
 ("The plus life", "Evangelism"),
 ("Love is reason to stay", "Faithfulness"),
 ("Sit quietly", "Devotion"),
 ("No middle ground", "Faithfulness"),
 ("Wait", "Leadership"),
 ("Continuity in faith", "Faith"),
 ("The height of servanthood", "Service"),
 ("Be extra", "Consecration"),
 ("The gospel is enough", "Salvation"),
 ("Identity crisis", "Identity"),
 ("Willingness and zeal", "Consecration"),
 ("A call to retreat", "Devotion"),
]

src = open(sys.argv[1], encoding="utf-8").read()
blocks = re.split(r"^## Article \d+\s*$", src, flags=re.M)[1:]
assert len(blocks) == len(T), (len(blocks), len(T))

def slugify(t):
    t = t.lower().replace("’", "").replace("'", "")
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")

out, seen = [], set()
for i, (block, meta) in enumerate(zip(blocks, T)):
    if meta is None:
        continue
    title, theme = meta
    paras = [p.strip() for p in block.strip().split("\n\n") if p.strip()]
    if title == "Until you meet the cross":  # the document holds a draft and a revision; keep the revision
        k = max(j for j, p in enumerate(paras) if p.startswith("Until Jesus happens to you"))
        paras = paras[k:]
    if paras and paras[0].strip().lower().rstrip("!") in {"the plus life", "extra", "identity crisis"}:
        paras = paras[1:]
    paras = [re.sub(r"\s{2,}", " ", p).replace("\n", " ") for p in paras]
    slug = slugify(title)
    assert slug not in seen, slug
    seen.add(slug)
    words = sum(len(p.split()) for p in paras)
    first = paras[0]
    excerpt = first if len(first) <= 170 else first[:first.rfind(" ", 0, 165)] + "…"
    out.append({"slug": slug, "title": title, "theme": theme, "author": "Agboola Abigail",
                "minutes": max(1, round(words / 200)), "excerpt": excerpt, "body": paras})

# Newest first is unknown, so show the most recent pieces in the document first.
out.reverse()
json.dump(out, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(out), "articles")

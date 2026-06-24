// Acta Sanctorum Devotional — FULL COVER WRAP (back + spine + front)
// KDP 6x9, cream paper, 327 interior pages.
//   spine = 327 * 0.0025in = 0.8175in
//   full  = 0.125 + 6 + 0.8175 + 6 + 0.125 = 13.0675in  x  9.25in (with 0.125 bleed)
// Build: typst compile cover-wrap.typ cover-wrap.pdf
// NOTE: regenerate spine if final page count or paper type changes.

#let cream = rgb("#efe6ce")
#let ink   = rgb("#2b2117")
#let faint = rgb("#7c6a4e")

#let bleed = 0.125in
#let tw = 6in
#let th = 9in
#let sp = 0.8175in
#let fullw = 2 * bleed + 2 * tw + sp
#let fullh = 2 * bleed + th

#set page(width: fullw, height: fullh, margin: 0pt, fill: cream)
#set text(fill: ink, font: ("EB Garamond 12", "Cormorant Garamond", "Baskerville"))

// Double-keyline frame inside a tw x th panel
#let frame(inset) = {
  place(top + left, dx: inset, dy: inset,
    rect(width: tw - 2 * inset, height: th - 2 * inset, stroke: 1.4pt + faint))
  place(top + left, dx: inset + 0.045in, dy: inset + 0.045in,
    rect(width: tw - 2 * inset - 0.09in, height: th - 2 * inset - 0.09in, stroke: 0.5pt + faint))
}

// =========================================================================
// FRONT PANEL (right)
// =========================================================================
#place(top + left, dx: bleed + tw + sp, dy: bleed)[
  #box(width: tw, height: th)[
    #frame(0.42in)
    #pad(0.62in)[
      #align(center)[
        #v(0.18in)
        #text(size: 33pt, tracking: 5pt)[ACTA]
        #v(-0.18in)
        #text(size: 33pt, tracking: 5pt)[SANCTORVM]

        #v(0.12in)
        #box(width: 1.35in, height: 0.5pt, fill: faint)
        #h(0.16in)
        #text(size: 13pt, fill: faint)[\u{2767}]
        #h(0.16in)
        #box(width: 1.35in, height: 0.5pt, fill: faint)

        #v(0.12in)
        #text(size: 17pt, style: "italic")[A Daily Devotional]

        #v(0.14in)
        #text(font: "EB Garamond SC 12", size: 10pt, tracking: 0.6pt, fill: faint)[Three hundred fifteen lives of the saints]
        #linebreak()
        #text(font: "EB Garamond SC 12", size: 10pt, tracking: 0.6pt, fill: faint)[January 1 — November 10]

        #v(0.18in)
        #box(stroke: 0.6pt + faint, inset: 3pt)[#image("engraving.png", height: 3.25in)]

        #v(0.24in)
        #text(size: 15pt, tracking: 2.5pt)[WILSON PRUITT]
        #v(0.06in)
        #text(size: 8.5pt, fill: faint, tracking: 0.5pt)[actasanctorum.org]
      ]
    ]
  ]
]

// =========================================================================
// SPINE (center) — reads top-to-bottom
// =========================================================================
#place(top + left, dx: bleed + tw, dy: 0in)[
  #box(width: sp, height: fullh)[
    #place(center + horizon)[
      #rotate(90deg, reflow: false)[
        #box(width: th - 1.6in)[
          #align(center)[
            #text(size: 12pt, tracking: 1.5pt)[ACTA SANCTORVM]
            #h(0.9em) #text(size: 11pt, fill: faint)[\u{2767}] #h(0.9em)
            #text(size: 10pt, style: "italic")[Wilson Pruitt]
          ]
        ]
      ]
    ]
    #place(center + bottom, dy: -0.55in)[
      #rotate(90deg, reflow: false)[#text(size: 8.5pt, tracking: 1.5pt, fill: faint)[WROOT PRESS]]
    ]
  ]
]

// =========================================================================
// BACK PANEL (left)
// =========================================================================
#place(top + left, dx: bleed, dy: bleed)[
  #box(width: tw, height: th)[
    #frame(0.42in)
    #pad(left: 0.78in, right: 0.78in, top: 0.9in, bottom: 0.75in)[
      #align(center)[
        #text(size: 14pt, tracking: 2pt)[ACTA SANCTORVM]
        #v(0.06in)
        #text(size: 10pt, style: "italic", fill: faint)[A Daily Devotional]
      ]
      #v(0.4in)
      #set par(justify: true, leading: 0.55em, first-line-indent: 0pt, spacing: 0.75em)
      #set text(size: 10.5pt)

      For three hundred years the Bollandists of Antwerp set themselves an all but impossible task: to gather the life of every saint the Church remembers, day by day through the calendar year. Sixty-eight folio volumes appeared between 1643 and 1940 — and even so the work reached only as far as the tenth of November before it outran its makers.

      This is a daily companion drawn from that vast compendium. Three hundred and fifteen entries, one for each day from the first of January to the tenth of November, each grounded in the _Acta_'s own account of the day's saint and told in about three hundred words: a scene, a life, and a quiet turn toward the reader. Kings and beggars, scholars and shepherds, martyrs and mystics — the famous and the nearly forgotten — set down in the order the year keeps them.

      #v(0.25in)
      #align(center)[
        #text(size: 11.5pt, style: "italic")[“The Roman calendar holds the feasts;]
        #linebreak()
        #text(size: 11.5pt, style: "italic")[this book holds the saints.”]
      ]
    ]
    // Imprint, bottom-left — kept clear of the bottom-right barcode zone
    #place(bottom + left, dx: 0.78in, dy: -0.62in)[
      #text(size: 9pt, tracking: 1.5pt, fill: faint)[WROOT PRESS]
      #linebreak()
      #text(size: 8.5pt, fill: faint)[actasanctorum.org]
    ]
    // KDP barcode reserve — mask the frame out of the bottom-right corner so
    // the auto-generated barcode (≈2in × 1.2in, 0.25in off trim) lands on a
    // clean cream field. KDP silently rejects covers with art in this zone.
    #place(bottom + right, dx: -0.12in, dy: -0.12in)[
      #rect(width: 2.35in, height: 1.4in, fill: cream, stroke: none)
    ]
  ]
]

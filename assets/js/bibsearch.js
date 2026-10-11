document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("bibsearch");
  if (!input) return;

  const entries = Array.from(document.querySelectorAll(".publications .bibliography > li"));
  const lists = Array.from(document.querySelectorAll(".publications ol.bibliography"));
  const status = document.getElementById("bibsearch-status");
  const empty = document.getElementById("bibsearch-empty");
  const normalize = (value) => value.normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, " ").trim();
  const searchable = entries.map((element) => {
    const paper = element.querySelector(".paper-body");
    return {
      element,
      text: normalize([paper?.textContent || element.textContent, paper?.dataset.year || ""].join(" ")),
    };
  });

  const filterItems = () => {
    const terms = normalize(input.value).split(" ").filter(Boolean);
    let visible = 0;

    searchable.forEach(({ element, text }) => {
      const matches = terms.every((term) => text.includes(term));
      element.classList.toggle("unloaded", !matches);
      if (matches) visible += 1;
    });

    lists.forEach((list) => {
      const hasMatches = Array.from(list.children).some((item) => !item.classList.contains("unloaded"));
      list.classList.toggle("unloaded", !hasMatches);
      const heading = list.previousElementSibling;
      if (heading?.matches("h2.bibliography, h3.bibliography")) {
        heading.classList.toggle("unloaded", !hasMatches);
      }
    });

    if (status) {
      status.textContent = terms.length ? visible + " of " + entries.length + " publications" : entries.length + " publications";
    }
    if (empty) empty.hidden = visible !== 0;
  };

  const applyHash = () => {
    let hash;
    try {
      hash = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      hash = "";
    }
    // A citation anchor should navigate to its paper without filtering the list.
    input.value = hash && document.getElementById(hash) ? "" : hash;
    filterItems();
  };

  input.addEventListener("input", filterItems);
  input.addEventListener("search", filterItems);
  window.addEventListener("hashchange", applyHash);
  applyHash();
});

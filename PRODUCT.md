# Product

## What this is

A private, static portfolio that presents documented infrastructure work from a homelab: five case studies, a thematic development map and an interactive Homelab Explorer service map. It is reviewed locally and through the repository's private CI.

## Who it is for

A technical reader — hiring manager, engineer or peer — who wants to see how problems were framed, which tradeoffs were chosen and what the evidence actually showed, without needing a demonstration environment.

## What must stay true

- Every case is traceable to a documented source; past observations are not presented as current live state.
- No credentials, addresses, internal usernames or operational inventory appear in the published surface.
- Nothing invented: no job titles, seniority, certifications, metrics or dates that the sources do not support.
- The site works without WebGL and without interacting with the map; the DOM and inline SVG carry the same information.
- The service map teaches documented relationships and decisions. It never presents live health, uptime, operational status or a physical inventory.
- The source repository stays private. A public GitHub Pages site may deploy from it only when the account plan permits it; never change repository visibility.

## Out of scope for the MVP

Simulating failures, offering operational controls, publishing a résumé download that does not exist, and adding collaboration or analytics infrastructure.

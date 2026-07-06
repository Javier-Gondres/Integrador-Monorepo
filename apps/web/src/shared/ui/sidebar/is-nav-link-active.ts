function pathnameMatchesHref(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Un ítem del nav está activo si la ruta coincide y ningún otro ítem
 * con un `href` más específico (más largo) también coincide.
 */
export function isNavLinkActive(
  pathname: string,
  href: string,
  allHrefs: readonly string[],
): boolean {
  if (!pathnameMatchesHref(pathname, href)) {
    return false;
  }

  return !allHrefs.some(
    (other) =>
      other !== href &&
      other.length > href.length &&
      pathnameMatchesHref(pathname, other),
  );
}

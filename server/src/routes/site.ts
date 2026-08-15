import { Router } from "express";
import { asyncHandler, ok } from "../lib/errors";
import {
  SiteSettings,
  ThemeSettings,
  Navigation,
  Footer,
  SeoDefaults,
  HomePage,
} from "../models/settings";

const router = Router();

/** One fetch the client uses to hydrate layout + theme + homepage structure. */
router.get(
  "/bootstrap",
  asyncHandler(async (_req, res) => {
    const [settings, theme, navigation, footer, seo, homepage] = await Promise.all([
      SiteSettings.findOne().lean(),
      ThemeSettings.findOne().lean(),
      Navigation.findOne().lean(),
      Footer.findOne().lean(),
      SeoDefaults.findOne().lean(),
      HomePage.findOne().lean(),
    ]);

    const sections = (homepage?.sections ?? [])
      .filter((s: any) => s.enabled !== false)
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

    ok(res, {
      settings,
      theme,
      navigation,
      footer,
      seo,
      homepage: { sections },
    });
  })
);

export default router;

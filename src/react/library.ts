import { createLibrary, type Library } from "@openuidev/react-lang";
import { actions } from "./actions";
import { functions } from "./functions";
import { Chart } from "./components/chart";
import { Carousel, Celebration, Code, Flashcard, MathBlock, Popover, Quote, YouTube } from "./components/extra";
import { Button, Checkbox, DatePicker, IconButton, Input, Pressable, RadioGroup, SegmentedControl, Select, Slider, TextArea, Timer } from "./components/controls";
import { Box, Card, Col, Divider, Form, Grid, Row, Spacer } from "./components/layout";
import { Icon, Image, SearchImage } from "./components/media";
import { svgComponents } from "./components/svg";
import { Table } from "./components/table";
import { Badge, Caption, Label, Link, List, ListItem, Markdown, Text, Title } from "./components/text";
import type { IuiPlugin } from "./plugin";

export interface IuiLibraryOptions {
  /** Enables fixed-origin third-party video embeds. */ trustedExtras?: boolean;
  /** Custom signatures need a distinct ID; register their version explicitly. */ id?: string;
  plugins?: readonly IuiPlugin[];
}
export function createIuiLibrary(options: IuiLibraryOptions = {}): Library {
  if (options.plugins?.length && (!options.id || ["core", "core-trusted"].includes(options.id))) throw new Error("Plugins require a distinct library ID");
  const plugins = options.plugins ?? [];
  const components = [Col, Row, Box, Grid, Card, Carousel, Popover, Divider, Spacer, Title, Text, Caption, Label, Badge, Link, List, ListItem, Markdown, Quote, Code, MathBlock, Button, IconButton, Pressable, Input, TextArea, Select, SegmentedControl, Slider, Checkbox, RadioGroup, DatePicker, Timer, Form, SearchImage, Image, Icon, Table, Chart, Flashcard, Celebration, ...svgComponents, ...(options.trustedExtras ? [YouTube] : []), ...plugins.flatMap(p => p.components ?? [])];
  const allFunctions = [...functions, ...plugins.flatMap(p => p.functions ?? [])];
  const allActions = [...actions, ...plugins.flatMap(p => p.actions ?? [])];
  for (const group of [components, allFunctions, allActions]) { const names = group.map(item => item.name); if (new Set(names).size !== names.length) throw new Error("Duplicate registry name"); }
  return createLibrary({
    id: options.id ?? (options.trustedExtras ? "core-trusted" : "core"), root: "Col",
    components, functions: allFunctions, actions: allActions,
    componentGroups: [
      { name: "Layout", components: ["Col", "Row", "Box", "Grid", "Card", "Carousel", "Popover", "Divider", "Spacer"], notes: ["gap/padding use 4px steps. Colors are named theme tokens or safe CSS colors."] },
      { name: "Text", components: ["Title", "Text", "Caption", "Label", "Badge", "Link", "List", "ListItem", "Markdown", "Quote", "Code", "Math"] },
      { name: "Inputs", components: ["Button", "IconButton", "Pressable", "Input", "TextArea", "Select", "SegmentedControl", "Slider", "Checkbox", "RadioGroup", "DatePicker", "Timer", "Form"] },
      { name: "Media and data", components: ["SearchImage", "Image", "Icon", "Table", "Chart", ...(options.trustedExtras ? ["YouTube"] : [])] },
      { name: "Play", components: ["Flashcard", "Celebration"] },
      { name: "Drawing", components: svgComponents.map(c => c.name) },
      ...plugins.map(p => ({ name: p.id, components: (p.components ?? []).map(c => c.name) })),
    ],
  });
}
export const library = createIuiLibrary();
export const trustedLibrary = createIuiLibrary({ trustedExtras: true });

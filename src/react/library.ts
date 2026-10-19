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

export interface IuiLibraryOptions { /** Enables fixed-origin third-party video embeds. Never enables arbitrary HTML/JS. */ trustedExtras?: boolean }
export function createIuiLibrary(options: IuiLibraryOptions = {}): Library {
  return createLibrary({
    id: options.trustedExtras ? "core-trusted" : "core", root: "Col",
    components: [Col, Row, Box, Grid, Card, Carousel, Popover, Divider, Spacer, Title, Text, Caption, Label, Badge, Link, List, ListItem, Markdown, Quote, Code, MathBlock, Button, IconButton, Pressable, Input, TextArea, Select, SegmentedControl, Slider, Checkbox, RadioGroup, DatePicker, Timer, Form, SearchImage, Image, Icon, Table, Chart, Flashcard, Celebration, ...svgComponents, ...(options.trustedExtras ? [YouTube] : [])],
    functions, actions,
    componentGroups: [
      { name: "Layout", components: ["Col", "Row", "Box", "Grid", "Card", "Carousel", "Popover", "Divider", "Spacer"], notes: ["gap/padding use 4px steps. Colors are named theme tokens or safe CSS colors."] },
      { name: "Text", components: ["Title", "Text", "Caption", "Label", "Badge", "Link", "List", "ListItem", "Markdown", "Quote", "Code", "Math"] },
      { name: "Inputs", components: ["Button", "IconButton", "Pressable", "Input", "TextArea", "Select", "SegmentedControl", "Slider", "Checkbox", "RadioGroup", "DatePicker", "Timer", "Form"] },
      { name: "Media and data", components: ["SearchImage", "Image", "Icon", "Table", "Chart", ...(options.trustedExtras ? ["YouTube"] : [])] },
      { name: "Play", components: ["Flashcard", "Celebration"] },
      { name: "Drawing", components: svgComponents.map(c => c.name) },
    ],
  });
}
export const library = createIuiLibrary();
export const trustedLibrary = createIuiLibrary({ trustedExtras: true });

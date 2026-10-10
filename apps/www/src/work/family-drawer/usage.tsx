import {
  FamilyDrawer,
  FamilyDrawerButton,
  FamilyDrawerClose,
  FamilyDrawerContent,
  FamilyDrawerItem,
  FamilyDrawerPage,
  FamilyDrawerPages,
  FamilyDrawerTrigger,
  useFamilyDrawer,
} from "./family-drawer";

function Pages() {
  const { setPage } = useFamilyDrawer();

  return (
    <FamilyDrawerPages>
      <FamilyDrawerPage value="menu">
        <FamilyDrawerItem onClick={() => setPage("confirm")}>Remove item</FamilyDrawerItem>
      </FamilyDrawerPage>
      <FamilyDrawerPage value="confirm">
        <FamilyDrawerButton onClick={() => setPage("menu")}>Cancel</FamilyDrawerButton>
      </FamilyDrawerPage>
    </FamilyDrawerPages>
  );
}

export function Example() {
  return (
    <FamilyDrawer defaultPage="menu">
      <FamilyDrawerTrigger>Options</FamilyDrawerTrigger>
      <FamilyDrawerContent>
        <FamilyDrawerClose />
        <Pages />
      </FamilyDrawerContent>
    </FamilyDrawer>
  );
}

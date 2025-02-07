import type ComboboxFramework from './combobox-framework';
import { KeyCode } from './helpers';

export function handleComboBoxKeyPress(
  this: ComboboxFramework,
  event: KeyboardEvent
): void {
  const isInputExpanded = () =>
    this.input?.getAttribute('aria-expanded') === 'true';

  // #region Handle the key press
  switch (event.key) {
    case KeyCode.ArrowDown:
      // If the popup is available, moves focus into the popup: If the autocomplete behavior automatically selected a suggestion before Down Arrow was pressed, focus is placed on the suggestion following the automatically selected suggestion. Otherwise, places focus on the first focusable element in the popup.
      if (!isInputExpanded()) {
        this.toggleList(true);
        if (this.list && !this.isAltModifierPressed)
          this.focusItem(this.list?.children[0] as HTMLElement);
      } else if (this.list?.children) {
        this.focusItem(this.list?.children[0] as HTMLElement);
      }
      event.preventDefault(); // prevent scrolling
      break;
    case KeyCode.ArrowUp:
      // (Optional): If the popup is available, places focus on the last focusable element in the popup.
      if (isInputExpanded() && this.list) {
        this.focusItem(
          this.list?.children[this.list.children.length - 1] as HTMLElement
        );
      }
      event.preventDefault(); // prevent scrolling
      break;
    case KeyCode.Escape:
      // Dismisses the popup if it is visible. Optionally, if the popup is hidden before Escape is pressed, clears the combobox.
      if (isInputExpanded() && this.list) {
        this.toggleList(false);
      } else if (this.input) {
        this.input.value = '';
      }
      this.input?.focus();
      break;
    case KeyCode.Enter:
      // Autocompletes the combobox with the first suggestion
      if (isInputExpanded() && this.list) {
        this.selectItem(this.list.children[0] as HTMLElement);
      }
      break;
    case KeyCode.Alt:
      this.isAltModifierPressed = true;
      break;
  }
  // #endregion
}

export function handleListKeyPress(
  this: ComboboxFramework,
  event: KeyboardEvent
): void {
  const li = event.target as HTMLElement;
  switch (event.key) {
    case KeyCode.Enter:
      // Select the item and close the list
      this.selectItem(li);
      break;
    case KeyCode.Escape:
      // Close the list and focus the input
      this.clearInput();
      break;
    case KeyCode.ArrowDown: {
      // Move focus to the next item in the list
      const nextLi = li.nextElementSibling as HTMLElement;
      if (nextLi) this.focusItem(nextLi);
      else if (this.list?.children)
        this.focusItem(this.list.children[0] as HTMLElement);
      event.preventDefault(); // prevent scrolling
      break;
    }
    case KeyCode.ArrowUp: {
      // If alt is pressed, close the list and focus the input
      if (this.isAltModifierPressed) {
        this.input?.focus();
        this.toggleList(false);
        event.preventDefault(); // prevent scrolling
        break;
      }

      // Move focus to the previous item in the list
      const previousLi = li.previousElementSibling as HTMLElement;
      if (previousLi) this.focusItem(previousLi);
      else if (this.list)
        this.focusItem(
          this.list.children[this.list.children.length - 1] as HTMLElement
        );
      event.preventDefault(); // prevent scrolling
      break;
    }
    case KeyCode.Alt:
      this.isAltModifierPressed = true;
      break;
    case KeyCode.Home:
    case KeyCode.End:
    case KeyCode.Backspace:
    case KeyCode.Delete:
    case KeyCode.ArrowRight:
    case KeyCode.ArrowLeft:
    default:
      // Move focus back to the input
      this.input?.focus();
      break;
  }
}

export function handleKeyUp(
  this: ComboboxFramework,
  event: KeyboardEvent
): void {
  if (event.key === 'Alt') this.isAltModifierPressed = false;
}

export function handleBlur(this: ComboboxFramework): void {
  // Set a timeout to force the focus event on the list item to fire before the foucsout event on the input element
  setTimeout(() => {
    if (this.querySelector(':focus')) return;

    this.forceValue();
    this.toggleList(false);
  }, 0);
}

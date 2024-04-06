import React from "react";
import "./combobox-wrapper.css";
import "../../../dist/combobox-framework";

export const ComboboxWrapper = ({ items, placeholder = "Choose a value" }) => {
    return (
        <combobox-framework>
            <input placeholder={placeholder} type="text" slot="input" data-cy="input" />
            <ul slot="list" data-cy="listbox">
                {items.map((item, index) => (
                    <li key={item.value} data-value={item.value} data-cy={item.value}>
                        {item.display}
                    </li>
                ))}
            </ul>
        </combobox-framework>
    );
};

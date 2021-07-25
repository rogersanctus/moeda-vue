<template>
    <div class="autocomplete" ref="autocompleteEl" @focus="onFocusAutocomplete" @blur="onLoseFocusAutocomplete" @click="onClickAutocomplete" @keydown="onKeyDown" tabindex="0">
        <div class="selected-box">{{selectedText}}</div>
        <div class="ghost-item" ref="ghostEl">{{ greaterItem }}</div>
        <div class="list-box" v-if="open">
            <div class="search-box">
                <input type="text" name="search" placeholder="Search" autofocus @focus="onSearchFocus" @blur="onSearchLoseFocus">
            </div>
            <div class="list-items" ref="listItemsEl">
                <ul>
                    <li v-for="(item, i) in items" :class="{ selected: selected && i === selected.index }" :key="i" @mouseenter="onMouseEnterItem(item, i)" @click="onSelect(item, i)">
                        <span>
                            {{ typeof items === 'object' && description &&  description in item ? item[description] : item }}
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref, watch } from 'vue'

interface SelectableItem {
    index: number;
    item: any
}

export default defineComponent({
    props: {
        items: {
            type: Array as PropType<any[]>,
            required: true
        },
        modelValue: {
            required: true
        },
        code: {
            type: String,
            required: false
        },
        description: {
            type: String,
            required: false
        },
        noItemText: {
            type: String,
            required: false
        }
    },

    emits: ['update:modelValue'],

    setup(props, context) {
        const autocompleteEl = ref<HTMLElement | null>(null)
        const ghostEl = ref<HTMLElement | null>(null)
        const listItemsEl = ref<HTMLElement | null>(null)
        const open = ref<boolean>(false)
        let selected = ref<SelectableItem | null>(null)

        function strOfItem(item: any): string {
            return props.description && typeof item === 'object' ? item[props.description] : item
        }

        const selectedText = computed<string>(() => {
            if(props.modelValue) {
                return strOfItem(props.modelValue)
            }

            return props.noItemText || "Select an item"
        })

        const greaterItem = computed<string>(() => {
            function itemLength(item: any): number {
                if(typeof item === 'object' && props.description) {
                    return item[props.description].toString().length
                }
                return item.toString().length
            }

            const items = props.items
            let greater = 0

            return items.reduce<string>((prev, current) => {
                const len = itemLength(current)
                if(len > greater) {
                    prev = strOfItem(current)
                    greater = len
                }

                return prev
            }, '')
        })

        watch(() => props.modelValue, (value: any) => {
            const index = props.items.findIndex((item) => {
                const idKey = props.code || props.description
                if(typeof item === 'object' && idKey && value) {
                    return item[idKey] === value[idKey]
                }
            })

            if(index !== -1) {
                selected.value = { item: value, index }
            }
        })

        watch(listItemsEl, (value) => {
            if(value && open.value) {
                scrollToCurrent()
            }
        })

        const listResizeObserver = new ResizeObserver(() => {
            const ghost = ghostEl.value
            const parent = autocompleteEl.value

            if(ghost && parent && parent.clientWidth < ghost.clientWidth) {
                parent.style.minWidth = ghost.clientWidth + 'px'
            }
        })

        function onSelect(item: any, index: number) {
            selected.value = { item, index }
            open.value = false
            autocompleteEl.value && autocompleteEl.value.blur()
            context.emit('update:modelValue', item)
        }

        function onFocusAutocomplete() {
        }

        function onLoseFocusAutocomplete(event: FocusEvent) {
            if(event.relatedTarget && (event.relatedTarget as HTMLInputElement).name === 'search') {
                return
            }

            open.value = false
        }

        function onClickAutocomplete(e: Event) {
            if(e.composedPath().find((target) => (target as HTMLElement).classList?.contains('list-box'))) {
                return
            }

            open.value = !open.value
        }

        function onSearchFocus() {
        }

        function onSearchLoseFocus() {
            open.value = false
        }

        function scrollToCurrent() {
            if(selected.value && listItemsEl.value) {
                const listItems = listItemsEl.value
                const currentEl = listItems.querySelector('ul>li.selected')
                const currentIndex = selected.value.index

                if(currentEl) {
                    if(currentIndex === 0) {
                        listItems.scrollTop = 0
                    } else if(currentIndex === props.items.length - 1) {
                        listItems.scrollTop = listItems.scrollHeight - currentEl.clientHeight
                    } else {
                        currentEl.scrollIntoView({behavior: 'auto', block: 'center', inline: 'nearest'})
                    }
                }
            }
        }

        function walkItem(direction: 'up' | 'down'): void {
            let currentIndex = selected.value?.index

            if(currentIndex == null) {
                return
            }

            if(direction === 'up') {
                currentIndex--

                if(currentIndex < 0) {
                    currentIndex = props.items.length - 1
                }
            } else if(direction === 'down') {
                currentIndex++

                if(currentIndex > props.items.length - 1) {
                    currentIndex = 0
                }
            }            

            selected.value = {
                item: props.items[currentIndex],
                index: currentIndex
            }

            scrollToCurrent()
        }

        function onKeyDown(event: KeyboardEvent) {
            console.log(event)
            if(event.code === "ArrowDown") {
                if(!open.value) {
                    open.value = true
                } else {
                    walkItem('down')
                }
            }

            if(event.code === "ArrowUp") {
                walkItem('up')
            }

            if(event.code === "Enter") {
                selected.value && onSelect(selected.value.item, selected.value.index)
            }
        }

        function onMouseEnterItem(item: any, index: number) {
            selected.value = { item, index }
        }

        onMounted(() => {
            if(ghostEl.value) {
                listResizeObserver.observe(ghostEl.value)
            }
        })

        return {
            open,
            autocompleteEl,
            ghostEl,
            listItemsEl,
            greaterItem,
            selected,
            selectedText,
            focus,
            onFocusAutocomplete,
            onLoseFocusAutocomplete,
            onClickAutocomplete,
            onSelect,
            onSearchFocus,
            onSearchLoseFocus,
            onKeyDown,
            onMouseEnterItem
        }
    },
})
</script>
<style lang="scss" scoped>
.autocomplete {
    position: relative;
    width: 100%;
    outline: none;

    .selected-box {
        display: flex;
        border: solid 1px var(--dark-color);
        border-radius: var(--border-radius);
        padding: var(--select-padding-y) var(--select-padding-x);
        font-size: 0.95rem;
        align-items: center;
        cursor: pointer;
        user-select: none;

        &::after {
            content: "";
            background-color: var(--dark-color);
            width: 0.8em;
            height: 0.6em;
            margin-left: auto;
            clip-path: polygon(0 0, 100% 0, 50% 100%);
        }
    }

    &:focus .selected-box {
        outline: none;
        border-color: var(--active-color);
        box-shadow: var(--box-shadow-3);
    }

    .ghost-item {
        position: absolute;
        visibility: hidden;
        padding: 0 var(--select-padding-x);
        white-space: nowrap;
    }

    .list-box {
        position: absolute;
        padding: var(--select-padding-y) 0;
        border: solid 1px var(--dark2-color);
        border-radius: var(--border-radius);
        background-color: #fff;
        margin-top: 2px;
        left: 0;
        right: 0;
        max-height: 350px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        z-index: 1;

        .search-box {
            padding: 0 var(--select-padding-x);
            margin-bottom: var(--select-padding-y);
        }

        .list-items {
            width: 100%;
            height: 100%;
            overflow-x: hidden;
            overflow-y: auto;

            ul {
                list-style: none;
                padding: 0;
                margin: 0;
                min-width: fit-content;

                li {
                    cursor: pointer;
                    padding: 0.2rem var(--select-padding-x);
                    color: var(--dark-color);
                    white-space: nowrap;
                    border-bottom: solid 1px var(--light-color);

                    &.selected {
                        background-color: #cadff7;
                    }

                    span {
                        display: block;
                    }
                }
            }
        }
    }
}
</style>
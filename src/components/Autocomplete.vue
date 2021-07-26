<template>
  <div
    ref="autocompleteEl"
    class="autocomplete"
    tabindex="0"
    @blur="onLoseFocusAutocomplete"
    @click="onClickAutocomplete"
    @keydown="onKeyDown"
  >
    <div class="selected-box">{{ selectedText }}</div>
    <div ref="ghostEl" class="ghost-item">{{ greaterItem }}</div>
    <div v-if="open" class="list-box">
      <div class="search-box">
        <input
          v-model="searchTerm"
          type="text"
          name="search"
          placeholder="Search"
          @focus="onSearchFocus"
          @blur="onSearchLoseFocus"
        />
      </div>
      <div ref="listItemsEl" class="list-items">
        <ul>
          <li
            v-for="(item, i) in filtered"
            :key="i"
            :class="{ selected: selected && i === selected.index }"
            @mouseenter="onMouseEnterItem(item, i)"
            @click="onSelect(item, i)"
          >
            <span>
              {{
                typeof item === 'object' && description
                  ? item[description]
                  : item
              }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref, watch } from 'vue'

type ItemPrimitiveType = string | number
type ItemType = ItemPrimitiveType | Record<string, ItemPrimitiveType>

interface SelectableItem {
  index: number
  item: ItemType
}

export default defineComponent({
  props: {
    items: {
      type: Array as PropType<ItemType[]>,
      required: true
    },
    modelValue: {
      type: Object as PropType<ItemPrimitiveType>,
      required: true
    },
    code: {
      type: String,
      required: false,
      default: () => null
    },
    description: {
      type: String,
      required: false,
      default: () => null
    },
    noItemText: {
      type: String,
      required: false,
      default: () => null
    }
  },

  emits: ['update:modelValue'],

  setup(props, context) {
    const autocompleteEl = ref<HTMLElement | null>(null)
    const ghostEl = ref<HTMLElement | null>(null)
    const listItemsEl = ref<HTMLElement | null>(null)
    const open = ref<boolean>(false)
    let selected = ref<SelectableItem | null>(null)
    const searchTerm = ref<string>('')
    const filtered = ref<Array<ItemType>>([])

    function strOfItem(item: ItemType): string {
      if (typeof item === 'object' && props.description) {
        return String(item[props.description])
      }

      return String(item)
    }

    const selectedText = computed<string>(() => {
      if (props.modelValue) {
        return strOfItem(props.modelValue)
      }

      return props.noItemText || 'Select an item'
    })

    const greaterItem = computed<string>(() => {
      function itemLength(item: ItemType): number {
        if (typeof item === 'object' && props.description) {
          return String(item[props.description]).length
        }
        return String(item).length
      }

      const items = props.items
      let greater = 0

      return items.reduce<string>((prev, current) => {
        const len = itemLength(current)
        if (len > greater) {
          prev = strOfItem(current)
          greater = len
        }

        return prev
      }, '')
    })

    watch(
      () => props.items,
      (value) => {
        filtered.value = filter(value)
      }
    )

    watch(listItemsEl, (value) => {
      if (value && open.value) {
        const idKey = props.code || props.description

        const index = filtered.value.findIndex((item) => {
          if (
            typeof item === 'object' &&
            idKey &&
            props.modelValue &&
            typeof props.modelValue === 'object'
          ) {
            const modelValue = props.modelValue
            return item[idKey] === modelValue[idKey]
          }

          return item === props.modelValue
        })

        if (index !== -1) {
          selected.value = { item: props.modelValue, index }
        }

        scrollToCurrent()
      }
    })

    watch(searchTerm, (value, old) => {
      if (value !== old) {
        filtered.value = filter(props.items)
      }
    })

    const listResizeObserver = new ResizeObserver(() => {
      const ghost = ghostEl.value
      const parent = autocompleteEl.value

      if (ghost && parent && parent.clientWidth < ghost.clientWidth) {
        parent.style.minWidth = ghost.clientWidth + 'px'
      }
    })

    function filter(list: Array<ItemType>): Array<ItemType> {
      const search = searchTerm.value.trim().toLowerCase()

      if (!search) {
        return [...props.items]
      }

      return list.filter((item) => {
        if (typeof item !== 'object') {
          return item.toString().toLowerCase().includes(search)
        }

        let description = '',
          code = ''

        if (props.description) {
          description = item[props.description].toString().toLowerCase()
        }

        if (props.code) {
          code = item[props.code].toString().toLowerCase()
        }

        return description.includes(search) || code.includes(search)
      })
    }

    function onSelect(item: ItemType, index: number) {
      selected.value = { item, index }
      open.value = false
      autocompleteEl.value && autocompleteEl.value.blur()
      context.emit('update:modelValue', item)
    }

    function onLoseFocusAutocomplete(event: FocusEvent) {
      if (
        event.relatedTarget &&
        (event.relatedTarget as HTMLInputElement).name === 'search'
      ) {
        return
      }

      open.value = false
    }

    function onClickAutocomplete(e: Event) {
      if (
        e
          .composedPath()
          .find((target) =>
            (target as HTMLElement).classList?.contains('list-box')
          )
      ) {
        return
      }

      open.value = !open.value
    }

    function onSearchFocus({ target }: InputEvent) {
      const input = target as HTMLInputElement | null

      if (input) {
        input.select()
      }
    }

    function onSearchLoseFocus(event: MouseEvent) {
      if (
        event.relatedTarget &&
        autocompleteEl.value?.contains(event.relatedTarget as Node)
      ) {
        return
      }
      open.value = false
    }

    function scrollToCurrent() {
      if (selected.value && listItemsEl.value) {
        const listItems = listItemsEl.value
        const liList = listItems.querySelectorAll('ul>li')
        const currentIndex = selected.value.index

        let currentEl = Array.prototype.find.call(
          liList,
          (li) => li.__vnode.key === currentIndex
        )

        if (currentEl) {
          if (currentIndex === 0) {
            listItems.scrollTop = 0
          } else if (currentIndex === filtered.value.length - 1) {
            listItems.scrollTop =
              listItems.scrollHeight - currentEl.clientHeight
          } else {
            currentEl.scrollIntoView({
              behavior: 'auto',
              block: 'center',
              inline: 'nearest'
            })
          }
        }
      }
    }

    function walkItem(direction: 'up' | 'down'): void {
      let currentIndex = selected.value?.index

      if (currentIndex == null) {
        return
      }

      if (direction === 'up') {
        currentIndex--

        if (currentIndex < 0) {
          currentIndex = filtered.value.length - 1
        }
      } else if (direction === 'down') {
        currentIndex++

        if (currentIndex > filtered.value.length - 1) {
          currentIndex = 0
        }
      }

      selected.value = {
        item: filtered.value[currentIndex],
        index: currentIndex
      }

      scrollToCurrent()
    }

    function onKeyDown(event: KeyboardEvent) {
      console.log(event)
      if (event.code === 'ArrowDown') {
        if (!open.value) {
          open.value = true
        } else {
          walkItem('down')
        }
      }

      if (event.code === 'ArrowUp') {
        walkItem('up')
      }

      if (event.code === 'Enter') {
        selected.value && onSelect(selected.value.item, selected.value.index)
      }
    }

    function onMouseEnterItem(item: ItemType, index: number) {
      selected.value = { item, index }
    }

    onMounted(() => {
      if (ghostEl.value) {
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
      filtered,
      searchTerm,
      focus,
      onLoseFocusAutocomplete,
      onClickAutocomplete,
      onSelect,
      onSearchFocus,
      onSearchLoseFocus,
      onKeyDown,
      onMouseEnterItem
    }
  }
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
      content: '';
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

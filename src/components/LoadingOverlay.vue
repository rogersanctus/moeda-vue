<template>
  <div v-if="loading" class="loading">
    <div class="bricks">
      <div class="col">
        <div class="brick"></div>
        <div class="wall"></div>
      </div>
      <div class="col">
        <div class="brick"></div>
        <div class="wall"></div>
      </div>
      <div class="col">
        <div class="brick"></div>
        <div class="wall"></div>
      </div>
      <div class="col">
        <div class="brick"></div>
        <div class="wall"></div>
      </div>
    </div>
    <span>Loading...</span>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    loading: {
      type: Boolean,
      required: true
    }
  }
})
</script>
<style lang="scss" scoped>
@keyframes buildingWall {
  0% {
    visibility: visible;
    bottom: 42px;
    height: 0;
  }
  8% {
    bottom: 28px;
  }
  16% {
    bottom: 14px;
  }
  24% {
    bottom: 0;
  }
  32% {
    bottom: 42px;
    height: 14px;
  }
  40% {
    bottom: 28px;
  }
  48% {
    bottom: 14px;
  }
  56% {
    bottom: 42px;
    height: 28px;
  }
  64% {
    bottom: 28px;
  }
  72% {
    bottom: 42px;
    height: 42px;
  }
  80% {
    bottom: 14px;
    visibility: hidden;
  }
}

.loading {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: #00000080;
  display: flex;
  flex-direction: column;
  z-index: 100;
  align-items: center;
  justify-content: center;
  user-select: none;
  cursor: progress;

  .bricks {
    display: flex;
    border: solid 1px #0ff;

    .col {
      display: flex;
      flex-direction: column;
      position: relative;
      width: 14px;
      height: 56px;

      .brick {
        visibility: hidden;
        position: absolute;
        width: 14px;
        height: 14px !important;
        background: #000;
        animation: buildingWall 4s step-end infinite;
      }

      .wall {
        position: absolute;
        width: 14px;
        height: 0;
        bottom: 0 !important;
        background: #000;
        animation: buildingWall 4s step-end infinite;
      }

      &:nth-child(1) .wall,
      &:nth-child(1) .brick {
        animation-delay: 190ms;
      }

      &:nth-child(2) .wall,
      &:nth-child(2) .brick {
        animation-delay: 252ms;
      }

      &:nth-child(3) .wall,
      &:nth-child(3) .brick {
        animation-delay: 295ms;
      }

      &:nth-child(4) .wall,
      &:nth-child(4) .brick {
        animation-delay: 0.15s;
      }
    }
  }
}
</style>

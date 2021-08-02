import { shallowMount } from '@vue/test-utils'

import Dashboard from '@/components/Dashboard.vue'

describe('Dashboard.vue', () => {
  test('If contains LoadingOverlay, ExchangeRateChart and Autocomplete components', () => {
    const wrapper = shallowMount(Dashboard)
    expect(
      wrapper.findComponent({ name: 'LoadingOverlay' }).exists()
    ).toBeTruthy()
    expect(
      wrapper.findComponent({ name: 'ExchangeRateChart' }).exists()
    ).toBeTruthy()
    expect(wrapper.findAllComponents({ name: 'Autocomplete' }).length).toBe(2)
  })
})

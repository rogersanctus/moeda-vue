import { shallowMount } from '@vue/test-utils'
import App from '@/App.vue'

describe('App.vue', () => {
  test('App contains only Dashboard component', () => {
    const wrapper = shallowMount(App)
    expect(wrapper.findComponent({ name: 'Dashboard' }).exists()).toBeTruthy()
    expect(wrapper.html()).toBe('<dashboard-stub></dashboard-stub>')
  })
})

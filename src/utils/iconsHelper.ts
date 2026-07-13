import { h, type FunctionalComponent, type SVGAttributes } from 'vue'

// This helper wrapper ensures all your custom SVGs accept custom CSS classes natively
const createIcon = (paths: () => any[]): FunctionalComponent<SVGAttributes> => {
  return (props) =>
    h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        ...props, // Merges custom classes or attributes passed from buttons
      },
      paths()
    )
}

// Paste your raw SVG inner paths cleanly right here:
export const Icons = {
 
 User: createIcon(() => [
    h('path', { d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' }),
    h('circle', { cx: '12', cy: '7', r: '4' })
  ]),

  Search: createIcon(() => [
    h('circle', { cx: '11', cy: '11', r: '8' }),
    h('line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' })
  ]),

  Edit: createIcon(() => [
    h('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
    h('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })
  ]),

  // Adjust your custom viewBox sizes natively if your logo is wider
  Logo: (props: SVGAttributes) => 
    h(
      'svg', 
      { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 789 172', fill: 'currentColor', ...props }, 
      [
        // Paste your exact unique custom OutScribed vector logo paths here
        h('path', { d: 'M374 7c-3 15-25 18-41 6l-4-3-23 14-23 15v33l11 7 11 8-9 11a65 65 0 0 0-20 28c-8 32 30 54 65 37q14-8 21-20 5-14-5-3-6 9-19 13c-7 3-28 4-36 2q-20-4-22-17-1-14 22-13 14 1 24 9l5 4 23-14 22-14V68l-4-3-19-10q-2 0 8-10 18-19 18-37 1-5-2-4-3 0-3 3m-60 42v17l-4-3-5-3V46c0-12 0-14 2-16q1-1 4 1l3 1zm13-11c8 3 24 3 30 0l5-2-3 4-5 6-17 14c-12 12-13 12-15 11l-3-1V53l1-17zm10 34 3 1v18l-1 19-8-2c-6-2-8-2-18-2-10-1-12 0-16 2l-6 2 27-26 16-14zm17 27c0 17-1 19-2 20l-5-2-3-2V75l5 3 5 2zM43 11c-9 4-21 15-26 23Q4 55 5 81c1 14 3 21 8 32q13 24 37 29c24 5 56-21 67-53 3-10 4-25 2-35q-5-15-15-28c-6-6-16-14-21-15L59 21l-24 9c0-1 6-10 12-15q5-5 4-6c0-3 0-3-8 2m27 65v48h-6q-11-1-20-10c-6-5-13-15-12-17l16-8 15-6V24l4 2 3 1zm13-39c5 4 13 15 14 19q2 1-11 7l-11 6V50c0-22-1-21 8-13M41 61v26l-5 2-6 2-3-7c-2-7-2-24 0-33q2-14 8-15c6-3 6-4 6 25m60 6 1 5-26 14-1-6 1-5 11-6 12-6zm0 32q-6 17-21 23l-5 2V92l14-7 13-7 1 7zm476-80-14 11 2 2 4 4c2 2 2 4 2 42v40l-5 4q-6 3-5 5 0 2 5-1l3-1 12 7 13 8 18-11 19-10V68l-8-7-9-8-10 7-10 6-1-28-1-28-15 10m29 53 5 6v47l-2-1-9-6-7-3V73l3-3 5-2zm-75-54-8 7-4 4 5 6 7 8 2 2 8-7 8-7-7-7-7-8zm189 12c0 14 0 15 2 14l9 7 8 7-10 6-10 6v52l10 7 13 8c1 1 5-1 20-10l18-10V70l4-2q4-3 1-5 0-3-4 1-3 3-5 1l-55-48q-1-3-1 14m38 70v25l-8-6-9-5V61l9 8 8 7zM230 53l-13 15 2 1 4 3c2 2 2 3 2 23v21l-5 4-5 3v2q1 3 4 0l3-2 9 8 9 7 11-6q14-6 11-7 0-3-4 0-3 2-7-3l-4-4V68l7-1c6 0 6 0 9-4l4-5h-20v-9q1-12-2-10zm175 9-16 9-1 25v25l13 9c12 8 13 8 15 7 4-2 24-20 24-21q0-3-7 1-4 3-7 3-8-1-14-7l-2-3V67l8 6q7 6 8 4l14-11-18-14zm77-3-6 7-6-7-6-6-21 14v2q1 3 4 0l4-2 2 3 3 4v44l-5 3-5 5q0 3 5 0l3-1 9 7 9 7 12-9c12-9 13-9 11-11q0-3-7 2l-3 2-4-2-3-3V70l5 3q21 9 26-16l-1-5-5 2q-6 5-12 0l-3-2zm-347 1q-12 8-10 8h3q4-3 9 1l2 24v22l-3 2-2 3 2 2 12 10 8 7 10-8q13-11 12-5c0 5 7 12 11 12l11-7q12-6 9-8-1-3-5 0-6 5-7-4V67l3-2q4-3 2-5l-1-2-3 2c-4 3-3 3-11-4l-3-3-8 7-8 7 5 4 4 4v43l-4 2-4 3-5-4-5-5V90c-1-23-1-23-3-28l-7-7-4-2zm387 0c-13 8-13 8-11 9q0 3 4 0l4-2 2 3 3 4v44l-5 4-5 4q0 3 5 0l3-1 7 7 9 6 22-18q-2-2-6 1l-4 2-2-2-3-2V68l-6-7-7-8zm145 3-19 10v23l-1 22-4 3q-4 3-2 5t5-1l4-3 13 9 12 8 34-27-1-3q0-2-9 5l-9 7q0 2-11-6c-10-6-10-7-10-10v-4l18-11 18-11-2-3-8-13-7-10zm10 10 6 9 2 3-8 5-8 5V67q3-4 8 6' }) 
      ]
    )
}

export default Icons
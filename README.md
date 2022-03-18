# Storken
Storken is a hook-based fully extendable and minimal state manager for React.

 Only supported for React v16.8+

# Installation
 ```sh
# for yarn
yarn add storken@beta

# for npm
npm install storken@beta
 ```

# Getting Started

First, create a store:
```js
import { createStorken } from 'storken'

const { 
  useStorken, 
  useLoading, 
  useUpdate, 
  usePlugin, 
  Storken
} = createStorken()
```

`creatStore` will give an array of contains these in order of:
- A hook function for access the state inside of a **React component**
- A hook function for access loading state of the main state inside of a **React component**
- A hook function for access update (getter) function of the state inside of a **React component**
- A hook function for access plugins of the state inside of a **React component**
- A class for access the whole Store from everywhere.

Additionally as a **suggestion**, exporting get/set methods from the Storken class may a useful approach.

```js
export const getStorken = Storken.get
export const setStorken = Storken.set
```

# Using the hook
Using of Storken's hook is designed like using React's built-in `useState` as simply.  

Storken's hook requires only 1 parameter which gets **name** of the state for know the options if exist in `createStore` arguments.  

In fact, if you want to access the state globally from everywhere, almost you don't need to learn anything new in this respect.  

Except one thing, you should define initial value of the state in `createStore` if you don't want to default value is `undefined`.

<details>
<summary>Example: JS</summary>

```js
import { createStorken } from 'storken'

const [useStorken] = createStore({
  initialValues: {
    counter: 0
  }
})


const Counter = () => {
  const [count, setCount] = useStorken('counter')

    return (
      <>
        <div id="count">{count}</div>
        <button onClick={() => setCount(count + 1)}>Increase value</button>
        <button onClick={() => setCount(count - 1)}>Decrease value</button>
      </>
    )
}
```
</details>

<details>
<summary>Example: TS</summary>

```ts
import { createStorken } from 'storken'


export const { 
  useStorken, 
  useLoading, 
  usePlugin,
  Storken: GlobalStorken
} = createStore({
  initialValues: {
    counter: 0 as number
  }
})


const Counter = () => {
  const [count, setCount] = useStorken<number>('counter')

    return (
      <>
        <div id="count">{count}</div>
        <button onClick={() => setCount(count + 1)}>Increase value</button>
        <button onClick={() => setCount(count - 1)}>Decrease value</button>
      </>
    )
}
```
</details>

If you want to set value of the state to initial value, just get a `reset` function after the `set` function.

```js
const Counter = () => {
  const [count, setCount, resetCount] = useStorken('counter')

    return (
      <>
        <div id="count">{count}</div>
        <button onClick={() => resetCount()}>Reset counter</button>

        <button onClick={() => setCount(count + 1)}>Increase value</button>
        <button onClick={() => setCount(count - 1)}>Decrease value</button>
      </>
    )
}
```

## Ok, let's see what it can do really?!

Storken offers 3 main feature.

1. Getters
2. Setters
3. Plugins

## 1- Getters
* Attach a getter function to the state. The getter function must be in `getters` section of `createStore` function arguments with the name of the state. Referred as `weather`.

* Storken provides a loading status while executing the getter. Referred as `loading`.
* Storken provides a function which can re-call the getter function. Referred as `update`.

```js
import { create as createStore } from 'storken'


const [useStorken] = createStore({
  getters: {
    // Assume the service provides a json like this: 
    // { place: "San Francisco, NC", "temperature": 10, "measurement": "celsius" }
    weather: () => fetch('http://myweatherservice.com/').then(res => res.json())
  }
})

const WeatherPage = () => {
  const [weather,,,loading, update] = useStorken('weather')

  return (
    <>
      {loading 
        ? <div id="loading">Please wait...</div> 
        : (
          <>
            <div id="place">{weather.place}</div>
            <div id="temperature">{weather.temperature} ({weather.measurement === 'celsius' ? '°C' : '°F'})</div>
            <button id="update" onClick={() => update()}>🔄 Refresh</button>
          </>
        )
      }
    </>
  )
  }
```
**Quick Tip:** There are different usage types of the hook. You can take look from [here](#using-the-hook-as-simpler)

### Advanced usage
First parameter of the getter function is Storken object belong to the state.  
The rest of the parameters can be getter specific optional parameters.


```js
import { useState } from 'react'
import { create as createStore } from 'storken'


const [useStorken] = createStore({
  getters: {
    // Assume the service provides a json like this: 
    // { place: "San Francisco, NC", "temperature": 10, "measurement": "celsius" }
    weather: (stork, place) => {
      return fetch('http://myweatherservice.com/' + place).then(res => res.json())
    }
})

const WeatherPage = () => {
  const [place, setPlace] = useState('San Francisco, NC')
  const [weather,,,loading, update] = useStorken('weather', place)

  return (
    <>
      {loading 
        ? <div id="loading">Please wait...</div> 
        : (
          <>
            <input type="text" value={place} onChange={({ target: { value } }) => setPlace(value)} />
            <div id="temperature">{weather.temperature} ({weather.measurement === 'celsius' ? '°C' : '°F'})</div>
            <button id="update" onClick={() => update()}>🔄 Refresh</button>
          </>
        )
      }
    </>
  )
  }
```
Storken object will be introduced additionally. For now, don't get this confused.

The place parameter could be just a string or anything. But we did it separated state. In this way runs getter function every changes of place value and changes weather data instantly.

## 2- Setters
Attaching a setter to a state, triggers the setter function every time setted the state.

```js
import { create as createStore } from 'storken'


const [useStorken] = createStore({
  setters: {
    language: (stork) => {
      const { value } = stork
      fetch('http://myapi.com/user/language/' + value)
    }
})

const LanguageComponent = () => {
  const [language, setLanguage] = useStorken('language')

  return (
    <>
      <div id="chosenLanguage">{language}</div>
      <button onClick={() => setLanguage('en')}>ENGLISH</button>
      <button onClick={() => setLanguage('tr')}>TURKISH</button>
    </>
  )
}
```

## 3- Plugins
Plugins are the best way to extend functions of this minimal library.

#### Official Plugins

- [storken-storage](/storkenjs/storken-storage)
- [storken-actions](/storkenjs/storken-actions)
- [storken-broadcast](/storkenjs/storken-broadcast)

When you want to use a plugin just define it into the `plugins` section of `createStore` arguments, as follows:
```js
import { create as createStore } from 'storken'
import StorkenActions from 'storken-actions'

const [useStorken] = createStore({
  plugins: {
    actions: StorkenActions
  }
})
```
The `actions` keyword may be change by arbitrary, it just defines usage name of the plugin. 

If need to specify a configuration for a plugin then do like this

```js
import { create as createStore } from 'storken'
import StorkenActions from 'storken-actions'

const [useStorken] = createStore({
  plugins: {
    actions: [StorkenActions, { ...actionsConfig }]
  }
})
```

You can find more use cases on their pages of plugins.

### Some Tricks
Every state that created by Storken is a Storken object 🙃 For this reason `createStorken` gets a `storkenOptions` object that contains `storken` specific configurations by name. So you can configure every state in.

#### Change default loading value

The loading value is `false` while initiating the state, if the getter exists then it turns to `true` while executing the getter function, after it ends the loading value becomes `false` again.  

But in some cases, it must be `true` as **default** while initiating whence we don't want to show empty things to user.

Simply specify what will be the loading state.

```js
import { create as createStore } from 'storken'

const [useStorken] = createStore({
  storkenOptions: {
    weather: {
      loading: true
    }
  }
})
```

# Using the hook as simpler

Storken provides more features than built-in `useState`, therefore hook's return length gets longer according to `useState`.

1. Access the return value with keys as follows
```js
const AnyComponent = () => {
  const {
    value,
    loading,
    update
  } = useStorken('weather')
}
```

```js
const AnyComponent = () => {
  const {
    value,
    loading,
    plugins: {
      actions
    }
  } = useStorken('weather')

  const onClick = () => actions.changeTemperature('fahrenheit')

  return (
    <>
      <button onClick={onClick}>Fahrenheit</button>
    </>
  )
}
```

2. Reproduce your own hook like this

```js
import { create as createStorken } from 'storken'
import StorkenActions from 'storken-actions'

const [useStorken] = createStorken({
  plugins: {
    actions: StorkenActions
  }
})

const useActions = (name, ...args) => useStorken(name, ...args).plugins.actions

```

## License
Distributed under the [MIT](/LICENSE.md) License.

## Contribution
You can contribute by fork this repository and make pull request.

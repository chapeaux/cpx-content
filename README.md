# Chapeaux Content Component

## Content Component Purpose

- Provide content injection via a variety of mechanisms
- Allow targeted content placement with sensible fallback and fail states

## Events

- `content-ready` - fires when 

## Usage

- ### Server-side or on-page

  #### Server-side template example
      ```html
      <cpx-content url="https://www.example.com/content">
          <template>
          <h1>Hello ${given_name}!</h1>
          </template>
      </cpx-content>
      ```

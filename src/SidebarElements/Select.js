import React from 'react'

/**
 * select item of list ui
 */
export default function Select ({ title, onChange, value, list_of_options, ...props }) {
  const style_container = {
    padding: '8px 16px'
  }
  const style_children = {
    display: 'inline'
  }
  return (
        <div style={style_container}>
            <h5 style={style_children}>{title}</h5>
            <select
                style={style_children}
                onChange={onChange}
                value={value}
            >
                {list_of_options.map((option, index) => (
                    <option key={option} value={index}>
                        {option}
                    </option>
                ))}
            </select>
        </div>)
}

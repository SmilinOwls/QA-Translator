import React from 'react'

function LanguageList({tab, language, setLanguage}) {
    return (
        <ul className="list-group list-group-horizontal">
            {tab.map((item, _) => {
                const key = Object.keys(item)[0];
                const value = item[key];
                return (
                    <li key={value} className={`list-group-item ${language == value ? "active" : ""}`} onClick={() => { setLanguage(value); }}>{key}</li>
                )
            })}
        </ul>
    )
}

export default LanguageList
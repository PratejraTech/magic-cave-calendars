import * as React from "react"

export interface RadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export interface RadioGroupItemProps {
  value: string
  id?: string
  children?: React.ReactNode
  className?: string
}

const RadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onValueChange,
  children,
  className = ""
}) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={`grid gap-2 ${className}`}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

const RadioGroupItem: React.FC<RadioGroupItemProps> = ({
  value,
  id,
  children,
  className = ""
}) => {
  const { value: selectedValue, onValueChange } = React.useContext(RadioGroupContext)
  const isSelected = selectedValue === value

  return (
    <div className="flex items-center space-x-2">
      <input
        type="radio"
        id={id}
        value={value}
        checked={isSelected}
        onChange={() => onValueChange?.(value)}
        className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ${className}`}
      />
      {children}
    </div>
  )
}

export { RadioGroup, RadioGroupItem }
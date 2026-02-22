const TickFrequencyInput = ({ tickFrequency, onChange }) => {
  const [localValue, setLocalValue] = React.useState(tickFrequency);

  React.useEffect(() => {
    setLocalValue(tickFrequency);
  }, [tickFrequency]);

  const handleChange = (event) => {
    const value = event.target.value;
    setLocalValue(value);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      const clamped = Math.max(200, Math.min(8000, numValue));
      onChange(clamped);
    }
  };

  const handleBlur = () => {
    setLocalValue(tickFrequency);
  };

  return (
    <MaterialUI.TextField
      className="input-fixed-width"
      label="Tick Freq (Hz)"
      type="number"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      inputProps={{ min: 200, max: 8000, step: 50 }}
      size="small"
    />
  );
};

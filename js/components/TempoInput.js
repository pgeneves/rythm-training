const TempoInput = ({ tempo, onChange }) => {
  const [localValue, setLocalValue] = React.useState(tempo);

  React.useEffect(() => {
    setLocalValue(tempo);
  }, [tempo]);

  const handleChange = (event) => {
    const value = event.target.value;
    setLocalValue(value);

    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(40, Math.min(240, numValue));
      onChange(clampedValue);
    }
  };

  const handleBlur = () => {
    setLocalValue(tempo);
  };

  return (
    <MaterialUI.TextField
      className="input-fixed-width"
      label="Tempo (BPM)"
      type="number"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      inputProps={{
        min: 40,
        max: 240,
        step: 1
      }}
      size="small"
    />
  );
};

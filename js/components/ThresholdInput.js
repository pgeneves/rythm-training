const ThresholdInput = ({ threshold, onChange }) => {
  const [localValue, setLocalValue] = React.useState(threshold);

  React.useEffect(() => {
    setLocalValue(threshold);
  }, [threshold]);

  const handleChange = (event) => {
    const value = event.target.value;
    setLocalValue(value);

    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(0.001, Math.min(0.5, numValue));
      onChange(clampedValue);
    }
  };

  const handleBlur = () => {
    setLocalValue(threshold);
  };

  return (
    <MaterialUI.TextField
      className="input-fixed-width"
      label="Detection Threshold"
      type="number"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      inputProps={{
        min: 0.001,
        max: 0.8,
        step: 0.001,
      }}
      size="small"
    />
  );
};

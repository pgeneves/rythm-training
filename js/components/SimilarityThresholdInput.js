const SimilarityThresholdInput = ({ similarityThreshold, onChange }) => {
  const [localValue, setLocalValue] = React.useState(similarityThreshold);

  React.useEffect(() => {
    setLocalValue(similarityThreshold);
  }, [similarityThreshold]);

  const handleChange = (event) => {
    const value = event.target.value;
    setLocalValue(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const clamped = Math.max(0.1, Math.min(1.0, numValue));
      onChange(clamped);
    }
  };

  const handleBlur = () => {
    setLocalValue(similarityThreshold);
  };

  return (
    <MaterialUI.TextField
      className="input-fixed-width"
      label="Match Threshold"
      type="number"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      inputProps={{ min: 0.1, max: 1.0, step: 0.05 }}
      size="small"
    />
  );
};

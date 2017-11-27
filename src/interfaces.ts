// Interfaces and types

// A bin with start value (inclusive), end value (exclusive) and probability
type Bin = [number, number, number]

// Region id
type RegionId = 'nat' | 'hhs1' | 'hhs2' | 'hsh3' | 'hhs4' | 'hhs5' | 'hhs6' | 'hhs7' | 'hhs8' | 'hhs9' | 'hhs10'

// Target id
type TargetId = 1 | 2 | 3 | 4 | 'peak' | 'peak-wk' | 'onset-wk'

// Epiweek in the format yyyyww
type Epiweek = number

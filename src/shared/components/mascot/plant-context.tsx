"use client";

import {
	createContext,
	type ReactNode,
	useContext,
	useMemo,
	useState,
} from "react";

interface Plant {
	/** Meals followed today (one leaf each). */
	leaves: number;
	/** Day complete: the plant has its flower. */
	bloom: boolean;
}

const PlantContext = createContext<{
	plant: Plant;
	setPlant: (plant: Plant) => void;
}>({ plant: { leaves: 0, bloom: false }, setPlant: () => {} });

// Today's plant on the home screen: the check-in grows it (leaves, flower)
// and the water card shows the same plant being watered.
export function PlantProvider({
	initial,
	children,
}: {
	initial: Plant;
	children: ReactNode;
}) {
	const [plant, setPlant] = useState(initial);
	const value = useMemo(() => ({ plant, setPlant }), [plant]);
	return <PlantContext value={value}>{children}</PlantContext>;
}

export function usePlant() {
	return useContext(PlantContext);
}

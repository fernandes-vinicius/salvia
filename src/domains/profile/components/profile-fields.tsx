"use client";

import { OptionPicker } from "~/domains/profile/components/option-picker";
import { SexPicker } from "~/domains/profile/components/sex-picker";
import { TrainingFields } from "~/domains/profile/components/training-fields";
import { BODY_RANGES } from "~/domains/profile/schemas/profile-schema";
import type { BodyProfile } from "~/domains/profile/types/profile-types";
import {
	CARDIO_INTENSITIES,
	NEAT_LEVELS,
	STRENGTH_INTENSITIES,
	TRAINING_RANGES,
} from "~/domains/profile/utils/energy";
import { FormSection } from "~/shared/components/form-section";
import {
	Cake,
	Dumbbell,
	Footprints,
	HardHat,
	HeartPulse,
	Laptop,
	PersonStanding,
	Ruler,
	Sofa,
	Weight,
} from "~/shared/components/icons";
import { MeasureSlider } from "~/shared/components/measure-slider";
import { WhyItMatters } from "~/shared/components/why-it-matters";
import { formatFixed } from "~/shared/lib/format";
import { cn } from "~/shared/lib/utils";

const NEAT_ICONS = [Sofa, Laptop, PersonStanding, Footprints, HardHat];

interface ProfileFieldsProps {
	profile: BodyProfile;
	onChange: <K extends keyof BodyProfile>(
		key: K,
		value: BodyProfile[K],
	) => void;
	className?: string;
}

// Campos da TMB (corpo, dia a dia e treinos). Usados na aba TMB (com
// autosave) e na calculadora pública (só estado local).
export function ProfileFields({
	profile,
	onChange: update,
	className,
}: ProfileFieldsProps) {
	return (
		<div className={cn("flex flex-col gap-8", className)}>
			<FormSection
				title="Sobre você"
				description="A taxa em repouso muda conforme o sexo biológico e a idade."
			>
				<SexPicker
					value={profile.sex}
					onValueChange={(value) => update("sex", value)}
				/>
				<MeasureSlider
					label="Idade"
					icon={Cake}
					unit="anos"
					value={profile.ageYears}
					{...BODY_RANGES.ageYears}
					onValueChange={(value) => update("ageYears", value)}
				/>
				<WhyItMatters>
					<p>
						A fórmula usa o sexo biológico porque, em média, homens têm mais
						massa muscular, e músculo gasta mais em repouso. Com a idade, o
						gasto em repouso cai um pouco (cerca de 5 kcal por dia a menos a
						cada ano).
					</p>
				</WhyItMatters>
			</FormSection>

			<FormSection
				title="Medidas"
				description="Arraste ou use − e + pra ajustar."
			>
				<MeasureSlider
					label="Peso"
					icon={Weight}
					unit="kg"
					value={profile.weightKg}
					{...BODY_RANGES.weightKg}
					buttonStep={0.1}
					fractionDigits={1}
					onValueChange={(value) => update("weightKg", value)}
				/>
				<MeasureSlider
					label="Altura"
					icon={Ruler}
					unit="cm"
					value={profile.heightCm}
					{...BODY_RANGES.heightCm}
					onValueChange={(value) => update("heightCm", value)}
				/>
				<WhyItMatters>
					<p>
						O gasto acompanha o peso: cada quilo muda cerca de 10 kcal da taxa
						em repouso, fora o que você gasta pra se mexer. Use o peso de manhã,
						em jejum, e atualize aqui quando ele mudar uns 2 kg (com{" "}
						{formatFixed(profile.weightKg)} kg hoje).
					</p>
				</WhyItMatters>
			</FormSection>

			<FormSection
				title="Dia a dia"
				description="Como é a sua rotina SEM contar os treinos: trabalho, deslocamento, tarefas."
			>
				<OptionPicker
					label="Movimento do dia a dia"
					options={NEAT_LEVELS}
					value={profile.neatFactor}
					icons={NEAT_ICONS}
					formatHint={(option) => `Fator × ${formatFixed(option.value, 2)}`}
					onValueChange={(value) => update("neatFactor", value)}
				/>
				<WhyItMatters>
					<p>
						É a parte do gasto que mais varia entre as pessoas e a que mais
						erramos pra cima: quem treina pesado mas trabalha sentado ainda é
						sedentário aqui. Na dúvida, escolha a opção de baixo. Se a meta não
						funcionar, o ajuste pelo seu peso (aba Meta) corrige depois.
					</p>
				</WhyItMatters>
			</FormSection>

			<FormSection
				title="Musculação"
				description="Treino com pesos ou peso do corpo. Pense na média das últimas semanas."
			>
				<TrainingFields
					question="Faz musculação?"
					icon={Dumbbell}
					routine={profile.strength}
					weightKg={profile.weightKg}
					minutesRange={TRAINING_RANGES.strengthMinutes}
					intensities={STRENGTH_INTENSITIES}
					onChange={(routine) => update("strength", routine)}
				/>
				<WhyItMatters>
					<p>
						Contamos só o que o treino gasta além do repouso, no tempo de treino
						de verdade (sem o intervalo do celular). Musculação gasta menos do
						que parece: o ganho dela é no músculo, não nas calorias. Relógios e
						aparelhos costumam mostrar bem mais.
					</p>
				</WhyItMatters>
			</FormSection>

			<FormSection
				title="Cardio"
				description="Caminhada, corrida, bike, esportes e afins."
			>
				<TrainingFields
					question="Faz cardio?"
					icon={HeartPulse}
					routine={profile.cardio}
					weightKg={profile.weightKg}
					minutesRange={TRAINING_RANGES.cardioMinutes}
					intensities={CARDIO_INTENSITIES}
					onChange={(routine) => update("cardio", routine)}
				/>
				<WhyItMatters>
					<p>
						Pense na média das últimas semanas, não na semana mais animada.
						Escolha a intensidade pelo fôlego: leve dá pra conversar, moderado
						dá pra falar frases curtas, intenso quase não dá pra falar.
					</p>
				</WhyItMatters>
			</FormSection>
		</div>
	);
}

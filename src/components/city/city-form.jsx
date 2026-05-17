"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { AddCitySchema } from "@/schemas/CitySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";

const CityGeoFenceMap = dynamic(
  () => import("@/components/city/city-geo-fence-map"),
  { ssr: false },
);

const CityForm = ({ defaultValues, isSubmitting, onSubmit }) => {
  const normalizedDefaults = useMemo(
    () => ({
      name: defaultValues?.name ?? "",
      latitude: defaultValues?.latitude ?? undefined,
      longitude: defaultValues?.longitude ?? undefined,
      geoFence: defaultValues?.geoFence ?? [],
    }),
    [defaultValues],
  );

  const form = useForm({
    resolver: zodResolver(AddCitySchema),
    defaultValues: normalizedDefaults,
  });

  const { control, handleSubmit, watch, setValue, reset } = form;

  const cityName = watch("name");

  const searchCity = async (cityName) => {
    if (!cityName) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${cityName}`,
    );

    const data = await res.json();

    
    
    if (data?.length) {
      const { lat, lon } = data[0];
      setValue("latitude", Number(lat));
      setValue("longitude", Number(lon));
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      searchCity(cityName);
    }, 800); // debounce

    return () => clearTimeout(delay);
  }, [cityName]);

  const polygon = watch("geoFence") || [];

  const rawLat = watch("latitude");
  const rawLng = watch("longitude");

  const latitude = typeof rawLat === "number" ? rawLat : Number(rawLat) || 26.5;

  const longitude =
    typeof rawLng === "number" ? rawLng : Number(rawLng) || 80.3;

  useEffect(() => {
    reset(normalizedDefaults);
  }, [normalizedDefaults, reset]);

  const polygonCoords = defaultValues?.geoFence || [];

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City Name</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-5">
          <FormField
            control={control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      field.onChange(value === "" ? undefined : Number(value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      field.onChange(value === "" ? undefined : Number(value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormItem>
          <FormLabel>City Boundary</FormLabel>

          {/* Leaflet */}
          <CityGeoFenceMap
            latitude={latitude}
            longitude={longitude}
            polygon={polygon}
            polygonCoords={polygonCoords}
            onChange={(coords) =>
              setValue("geoFence", coords, { shouldValidate: true })
            }
          />

          <FormMessage />
        </FormItem>

        <div className="flex justify-end">
          <Button variant="medico" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : "Save City"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CityForm;

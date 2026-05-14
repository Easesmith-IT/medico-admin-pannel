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
import { useEffect } from "react";

const CityGeoFenceMap = dynamic(
  () => import("@/components/city/city-geo-fence-map"),
  { ssr: false },
);

const CityForm = ({ defaultValues, isSubmitting, onSubmit }) => {
  const form = useForm({
    resolver: zodResolver(AddCitySchema),
    defaultValues: {
      name: defaultValues?.name || "",
      latitude: defaultValues?.latitude,
      longitude: defaultValues?.longitude,
      geoFence: defaultValues?.geoFence ? defaultValues.geoFence : [],
    },
  });

  const { control, handleSubmit, watch, setValue, getValues } = form;

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
    if (defaultValues) {
      setValue("name", defaultValues.name);
      setValue("latitude", defaultValues.latitude);
      setValue("longitude", defaultValues.longitude);
      setValue(
        "geoFence",
        defaultValues?.geoFence ? defaultValues.geoFence : [],
      );
    }
  }, [defaultValues]);

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
                <Input {...field} />
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
                  <Input type="number" {...field} />
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
                  <Input type="number" {...field} />
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

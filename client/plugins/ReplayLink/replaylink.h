#pragma once

#include <cstdint>

namespace replay
{
	struct vector2 
	{ 
		vector2(float a_x, float a_y) 
			: x(a_x), y(a_y)
		{
		}

		float x; float y; 
	};

	bool connect_to_league();

	class camera
	{
	public:
		camera() { }
		virtual ~camera() { }

		virtual bool init() = 0;

		virtual vector2 get_position() = 0;
		virtual void set_position(float x, float y) = 0;
	};

	class camera_impl : public camera
	{
	public:
		camera_impl();
		~camera_impl() { }

		bool init();

		vector2 get_position();
		void set_position(float x, float y);
		void set_position(vector2 vec);

	private:
		uint32_t object_address;
	};

	class controls
	{
	public:
		controls() { }
		virtual ~controls() { }

		virtual bool init() = 0;

		virtual void set_time(float time) = 0;
		virtual float get_time() = 0;

	};

	class controls_impl 
	{
	public: 
		controls_impl();
		~controls_impl() { }

		bool init();
		void set_time(float time);
		float get_time();

	private:
		uint32_t object_address = 0;
		uint32_t set_time_address = 0;
		uint32_t time_address = 0;
	};
};